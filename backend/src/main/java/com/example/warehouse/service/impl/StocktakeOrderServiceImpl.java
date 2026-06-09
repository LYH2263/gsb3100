package com.example.warehouse.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.warehouse.entity.Goods;
import com.example.warehouse.entity.InventoryRecord;
import com.example.warehouse.entity.StocktakeOrder;
import com.example.warehouse.entity.StocktakeOrderItem;
import com.example.warehouse.mapper.StocktakeOrderMapper;
import com.example.warehouse.service.GoodsService;
import com.example.warehouse.service.InventoryRecordService;
import com.example.warehouse.service.StocktakeOrderItemService;
import com.example.warehouse.service.StocktakeOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class StocktakeOrderServiceImpl extends ServiceImpl<StocktakeOrderMapper, StocktakeOrder> implements StocktakeOrderService {

    @Autowired
    private GoodsService goodsService;

    @Autowired
    private StocktakeOrderItemService stocktakeOrderItemService;

    @Autowired
    private InventoryRecordService inventoryRecordService;

    @Override
    @Transactional
    public StocktakeOrder createOrder(Long categoryId, String remark, Long creatorId, String creatorName) {
        StocktakeOrder order = new StocktakeOrder();
        String orderNo = "PD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        order.setOrderNo(orderNo);
        order.setCategoryId(categoryId);
        order.setStatus("DRAFT");
        order.setCreatorId(creatorId);
        order.setCreatorName(creatorName);
        order.setRemark(remark);
        save(order);

        QueryWrapper<Goods> queryWrapper = new QueryWrapper<>();
        if (categoryId != null) {
            queryWrapper.eq("category_id", categoryId);
        }
        List<Goods> goodsList = goodsService.list(queryWrapper);

        for (Goods goods : goodsList) {
            StocktakeOrderItem item = new StocktakeOrderItem();
            item.setOrderId(order.getId());
            item.setGoodsId(goods.getId());
            item.setGoodsName(goods.getName());
            item.setGoodsCode(goods.getCode());
            item.setSystemStock(goods.getStock());
            item.setActualStock(null);
            item.setDiffQuantity(null);
            stocktakeOrderItemService.save(item);
        }

        return order;
    }

    @Override
    public List<StocktakeOrderItem> getItemsByOrderId(Long orderId) {
        QueryWrapper<StocktakeOrderItem> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("order_id", orderId);
        queryWrapper.orderByAsc("id");
        return stocktakeOrderItemService.list(queryWrapper);
    }

    @Override
    @Transactional
    public void updateActualStock(Long itemId, Integer actualStock) {
        StocktakeOrderItem item = stocktakeOrderItemService.getById(itemId);
        if (item == null) {
            throw new RuntimeException("盘点明细不存在");
        }

        StocktakeOrder order = getById(item.getOrderId());
        if (order == null || !"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("仅草稿状态的盘点单可录入实盘");
        }

        item.setActualStock(actualStock);
        if (actualStock != null) {
            item.setDiffQuantity(actualStock - item.getSystemStock());
        } else {
            item.setDiffQuantity(null);
        }
        stocktakeOrderItemService.updateById(item);
    }

    @Override
    @Transactional
    public void confirmOrder(Long orderId, Long confirmerId, String confirmerName) {
        StocktakeOrder order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("盘点单不存在");
        }
        if (!"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("仅草稿状态的盘点单可确认");
        }

        List<StocktakeOrderItem> items = getItemsByOrderId(orderId);
        for (StocktakeOrderItem item : items) {
            if (item.getActualStock() == null) {
                throw new RuntimeException("请先录入所有货物的实盘数量");
            }
        }

        for (StocktakeOrderItem item : items) {
            int diff = item.getDiffQuantity();
            if (diff != 0) {
                InventoryRecord record = new InventoryRecord();
                record.setGoodsId(item.getGoodsId());
                record.setType("ADJUST");
                record.setQuantity(Math.abs(diff));
                record.setOperatorId(confirmerId);
                record.setOperatorName(confirmerName);
                inventoryRecordService.save(record);

                goodsService.updateStock(item.getGoodsId(), diff);
            }
        }

        order.setStatus("CONFIRMED");
        order.setConfirmerId(confirmerId);
        order.setConfirmerName(confirmerName);
        order.setConfirmedAt(LocalDateTime.now());
        updateById(order);
    }

    @Override
    @Transactional
    public void deleteOrder(Long orderId) {
        StocktakeOrder order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("盘点单不存在");
        }
        if (!"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("仅草稿状态的盘点单可删除");
        }

        QueryWrapper<StocktakeOrderItem> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("order_id", orderId);
        stocktakeOrderItemService.remove(queryWrapper);

        removeById(orderId);
    }
}
