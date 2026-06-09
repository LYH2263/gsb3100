package com.example.warehouse.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.warehouse.entity.Category;
import com.example.warehouse.entity.Goods;
import com.example.warehouse.entity.InventoryRecord;
import com.example.warehouse.entity.StocktakeItem;
import com.example.warehouse.entity.StocktakeOrder;
import com.example.warehouse.mapper.StocktakeItemMapper;
import com.example.warehouse.mapper.StocktakeOrderMapper;
import com.example.warehouse.service.CategoryService;
import com.example.warehouse.service.GoodsService;
import com.example.warehouse.service.InventoryRecordService;
import com.example.warehouse.service.StocktakeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class StocktakeServiceImpl extends ServiceImpl<StocktakeOrderMapper, StocktakeOrder> implements StocktakeService {

    @Autowired
    private StocktakeItemMapper stocktakeItemMapper;

    @Autowired
    private GoodsService goodsService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private InventoryRecordService inventoryRecordService;

    @Override
    @Transactional
    public StocktakeOrder createOrder(StocktakeOrder order, Long categoryId) {
        String orderNo = "ST" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) 
                + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        order.setOrderNo(orderNo);
        order.setStatus("DRAFT");
        order.setCreatedAt(LocalDateTime.now());
        save(order);

        LambdaQueryWrapper<Goods> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(Goods::getCategoryId, categoryId);
        }
        List<Goods> goodsList = goodsService.list(wrapper);

        for (Goods goods : goodsList) {
            StocktakeItem item = new StocktakeItem();
            item.setOrderId(order.getId());
            item.setGoodsId(goods.getId());
            item.setSystemStock(goods.getStock());
            item.setActualStock(null);
            stocktakeItemMapper.insert(item);
        }

        order.setItems(stocktakeItemMapper.selectItemsWithGoodsInfo(order.getId()));
        return order;
    }

    @Override
    @Transactional
    public boolean updateActualStock(Long itemId, Integer actualStock) {
        StocktakeItem item = stocktakeItemMapper.selectById(itemId);
        if (item == null) {
            throw new RuntimeException("明细不存在");
        }
        StocktakeOrder order = getById(item.getOrderId());
        if (!"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("仅草稿状态可录入实盘");
        }
        item.setActualStock(actualStock);
        item.setUpdatedAt(LocalDateTime.now());
        return stocktakeItemMapper.updateById(item) > 0;
    }

    @Override
    @Transactional
    public boolean confirmOrder(Long orderId, Long confirmerId, String confirmerName) {
        StocktakeOrder order = getById(orderId);
        if (order == null) {
            throw new RuntimeException("盘点单不存在");
        }
        if (!"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("仅草稿状态可确认");
        }

        List<StocktakeItem> items = stocktakeItemMapper.selectItemsWithGoodsInfo(orderId);
        for (StocktakeItem item : items) {
            if (item.getActualStock() == null) {
                throw new RuntimeException("请先完成所有货物的实盘录入");
            }
            int diff = item.getActualStock() - item.getSystemStock();
            if (diff != 0) {
                Goods goods = goodsService.getById(item.getGoodsId());
                if (goods == null) {
                    throw new RuntimeException("货物不存在: " + item.getGoodsId());
                }
                int newStock = goods.getStock() + diff;
                if (newStock < 0) {
                    throw new RuntimeException("货物 " + goods.getName() + " 调整后库存不能为负");
                }
                goods.setStock(newStock);
                goodsService.updateById(goods);

                InventoryRecord record = new InventoryRecord();
                record.setGoodsId(item.getGoodsId());
                record.setType("ADJUST");
                record.setQuantity(Math.abs(diff));
                record.setOperatorId(confirmerId);
                record.setOperatorName(confirmerName);
                record.setCreatedAt(LocalDateTime.now());
                inventoryRecordService.save(record);
            }
        }

        order.setStatus("CONFIRMED");
        order.setConfirmerId(confirmerId);
        order.setConfirmerName(confirmerName);
        order.setConfirmedAt(LocalDateTime.now());
        return updateById(order);
    }

    @Override
    public StocktakeOrder getDetail(Long id) {
        StocktakeOrder order = getById(id);
        if (order != null) {
            if (order.getCategoryId() != null) {
                Category category = categoryService.getById(order.getCategoryId());
                if (category != null) {
                    order.setCategoryName(category.getName());
                }
            }
            List<StocktakeItem> items = stocktakeItemMapper.selectItemsWithGoodsInfo(id);
            for (StocktakeItem item : items) {
                item.setDifference(item.getActualStock() != null ? item.getActualStock() - item.getSystemStock() : null);
            }
            order.setItems(items);
        }
        return order;
    }

    @Override
    public List<StocktakeOrder> listOrders(String status) {
        LambdaQueryWrapper<StocktakeOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(status != null, StocktakeOrder::getStatus, status);
        wrapper.orderByDesc(StocktakeOrder::getCreatedAt);
        List<StocktakeOrder> orders = list(wrapper);
        for (StocktakeOrder order : orders) {
            if (order.getCategoryId() != null) {
                Category category = categoryService.getById(order.getCategoryId());
                if (category != null) {
                    order.setCategoryName(category.getName());
                }
            }
        }
        return orders;
    }
}
