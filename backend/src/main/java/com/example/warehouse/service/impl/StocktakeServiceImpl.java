package com.example.warehouse.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.warehouse.entity.Goods;
import com.example.warehouse.entity.InventoryRecord;
import com.example.warehouse.entity.StocktakeItem;
import com.example.warehouse.entity.StocktakeOrder;
import com.example.warehouse.mapper.StocktakeItemMapper;
import com.example.warehouse.mapper.StocktakeOrderMapper;
import com.example.warehouse.service.GoodsService;
import com.example.warehouse.service.InventoryRecordService;
import com.example.warehouse.service.StocktakeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class StocktakeServiceImpl implements StocktakeService {

    @Autowired
    private StocktakeOrderMapper orderMapper;
    @Autowired
    private StocktakeItemMapper itemMapper;
    @Autowired
    private GoodsService goodsService;
    @Autowired
    private InventoryRecordService inventoryRecordService;

    @Override
    @Transactional
    public StocktakeOrder createOrder(Long categoryId, String remark, Long creatorId, String creatorName) {
        LambdaQueryWrapper<Goods> wrapper = new LambdaQueryWrapper<Goods>()
                .eq(categoryId != null, Goods::getCategoryId, categoryId);
        List<Goods> goodsList = goodsService.list(wrapper);
        if (goodsList.isEmpty()) {
            throw new RuntimeException("所选范围内没有可盘点的货物");
        }

        StocktakeOrder order = new StocktakeOrder();
        order.setCode("ST" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        order.setCategoryId(categoryId);
        order.setStatus("DRAFT");
        order.setRemark(remark);
        order.setCreatorId(creatorId);
        order.setCreatorName(creatorName);
        order.setCreatedAt(LocalDateTime.now());
        orderMapper.insert(order);

        for (Goods g : goodsList) {
            StocktakeItem item = new StocktakeItem();
            item.setOrderId(order.getId());
            item.setGoodsId(g.getId());
            item.setGoodsName(g.getName());
            item.setGoodsCode(g.getCode());
            item.setSystemQty(g.getStock()); // 快照基准
            item.setActualQty(null);
            item.setDiff(null);
            itemMapper.insert(item);
        }
        return getDetail(order.getId());
    }

    @Override
    public List<StocktakeOrder> listOrders() {
        return orderMapper.selectList(new LambdaQueryWrapper<StocktakeOrder>()
                .orderByDesc(StocktakeOrder::getId));
    }

    @Override
    public StocktakeOrder getDetail(Long orderId) {
        StocktakeOrder order = orderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("盘点单不存在");
        List<StocktakeItem> items = itemMapper.selectList(
                new LambdaQueryWrapper<StocktakeItem>().eq(StocktakeItem::getOrderId, orderId));
        order.setItems(items);
        return order;
    }

    @Override
    @Transactional
    public void updateActualQty(Long itemId, Integer actualQty) {
        StocktakeItem item = itemMapper.selectById(itemId);
        if (item == null) throw new RuntimeException("盘点明细不存在");
        StocktakeOrder order = orderMapper.selectById(item.getOrderId());
        if (order == null || !"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("仅草稿状态可录入实盘");
        }
        item.setActualQty(actualQty);
        item.setDiff(actualQty == null ? null : actualQty - item.getSystemQty());
        itemMapper.updateById(item);
    }

    @Override
    @Transactional
    public void confirmOrder(Long orderId, Long confirmerId, String confirmerName) {
        StocktakeOrder order = orderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("盘点单不存在");
        if (!"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("仅草稿状态可确认");
        }
        List<StocktakeItem> items = itemMapper.selectList(
                new LambdaQueryWrapper<StocktakeItem>().eq(StocktakeItem::getOrderId, orderId));
        List<StocktakeItem> unfilled = new ArrayList<>();
        for (StocktakeItem it : items) {
            if (it.getActualQty() == null) unfilled.add(it);
        }
        if (!unfilled.isEmpty()) {
            throw new RuntimeException("存在未录入实盘的明细，无法确认");
        }

        // 差异调整：盘盈 IN / 盘亏 OUT，统一标记为 ADJUST
        for (StocktakeItem it : items) {
            int diff = it.getActualQty() - it.getSystemQty();
            it.setDiff(diff);
            itemMapper.updateById(it);
            if (diff == 0) continue;
            InventoryRecord record = new InventoryRecord();
            record.setGoodsId(it.getGoodsId());
            record.setType("ADJUST");
            record.setQuantity(diff); // 正为盘盈，负为盘亏
            record.setOperatorId(confirmerId);
            record.setOperatorName(confirmerName);
            record.setCreatedAt(LocalDateTime.now());
            // 流水落账与库存变更同事务
            inventoryRecordService.save(record);
            boolean ok = goodsService.updateStock(it.getGoodsId(), diff);
            if (!ok) throw new RuntimeException("调整库存失败: goodsId=" + it.getGoodsId());
        }

        order.setStatus("CONFIRMED");
        order.setConfirmerId(confirmerId);
        order.setConfirmerName(confirmerName);
        order.setConfirmedAt(LocalDateTime.now());
        orderMapper.updateById(order);
    }
}
