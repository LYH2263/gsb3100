package com.example.warehouse.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.warehouse.entity.*;
import com.example.warehouse.mapper.StocktakeMapper;
import com.example.warehouse.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class StocktakeServiceImpl extends ServiceImpl<StocktakeMapper, Stocktake> implements StocktakeService {

    @Autowired
    private StocktakeItemService stocktakeItemService;

    @Autowired
    private GoodsService goodsService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private InventoryRecordService inventoryRecordService;

    @Override
    @Transactional
    public Stocktake createStocktake(Stocktake stocktake) {
        stocktake.setStatus("DRAFT");
        stocktake.setCreatedAt(LocalDateTime.now());
        save(stocktake);

        LambdaQueryWrapper<Goods> wrapper = new LambdaQueryWrapper<Goods>();
        if (stocktake.getCategoryId() != null) {
            wrapper.eq(Goods::getCategoryId, stocktake.getCategoryId());
        }
        List<Goods> goodsList = goodsService.list(wrapper);

        for (Goods goods : goodsList) {
            StocktakeItem item = new StocktakeItem();
            item.setStocktakeId(stocktake.getId());
            item.setGoodsId(goods.getId());
            item.setGoodsName(goods.getName());
            item.setGoodsCode(goods.getCode());
            item.setSystemStock(goods.getStock());
            item.setActualStock(null);
            item.setDifference(null);
            item.setUnit(goods.getUnit());
            item.setCreatedAt(LocalDateTime.now());
            stocktakeItemService.save(item);
        }

        stocktake.setItems(stocktakeItemService.list(
                new LambdaQueryWrapper<StocktakeItem>()
                        .eq(StocktakeItem::getStocktakeId, stocktake.getId())
        ));

        if (stocktake.getCategoryId() != null) {
            Category cat = categoryService.getById(stocktake.getCategoryId());
            if (cat != null) {
                stocktake.setCategoryName(cat.getName());
            }
        }

        return stocktake;
    }

    @Override
    public Stocktake getStocktakeDetail(Long id) {
        Stocktake stocktake = getById(id);
        if (stocktake == null) return null;

        List<StocktakeItem> items = stocktakeItemService.list(
                new LambdaQueryWrapper<StocktakeItem>()
                        .eq(StocktakeItem::getStocktakeId, id)
        );
        stocktake.setItems(items);

        if (stocktake.getCategoryId() != null) {
            Category cat = categoryService.getById(stocktake.getCategoryId());
            if (cat != null) {
                stocktake.setCategoryName(cat.getName());
            }
        }

        return stocktake;
    }

    @Override
    @Transactional
    public void updateItems(Long stocktakeId, List<Map<String, Object>> itemUpdates) {
        Stocktake stocktake = getById(stocktakeId);
        if (stocktake == null) {
            throw new RuntimeException("盘点单不存在");
        }
        if ("CONFIRMED".equals(stocktake.getStatus())) {
            throw new RuntimeException("已确认的盘点单不可编辑");
        }

        for (Map<String, Object> update : itemUpdates) {
            Long itemId = Long.valueOf(update.get("id").toString());
            Integer actualStock = update.get("actualStock") != null
                    ? Integer.valueOf(update.get("actualStock").toString()) : null;

            StocktakeItem item = stocktakeItemService.getById(itemId);
            if (item == null || !item.getStocktakeId().equals(stocktakeId)) {
                continue;
            }
            item.setActualStock(actualStock);
            if (actualStock != null) {
                item.setDifference(actualStock - item.getSystemStock());
            } else {
                item.setDifference(null);
            }
            stocktakeItemService.updateById(item);
        }
    }

    @Override
    @Transactional
    public void confirmStocktake(Long stocktakeId, Long operatorId, String operatorName) {
        Stocktake stocktake = getById(stocktakeId);
        if (stocktake == null) {
            throw new RuntimeException("盘点单不存在");
        }
        if ("CONFIRMED".equals(stocktake.getStatus())) {
            throw new RuntimeException("盘点单已确认，不可重复确认");
        }

        List<StocktakeItem> items = stocktakeItemService.list(
                new LambdaQueryWrapper<StocktakeItem>()
                        .eq(StocktakeItem::getStocktakeId, stocktakeId)
        );

        for (StocktakeItem item : items) {
            if (item.getActualStock() == null) {
                throw new RuntimeException("货物「" + item.getGoodsName() + "」尚未录入实盘数量");
            }
        }

        for (StocktakeItem item : items) {
            int diff = item.getDifference();
            if (diff == 0) continue;

            InventoryRecord record = new InventoryRecord();
            record.setGoodsId(item.getGoodsId());
            record.setType("ADJUST");
            record.setQuantity(diff);
            record.setOperatorId(operatorId);
            record.setOperatorName(operatorName);
            record.setCreatedAt(LocalDateTime.now());

            inventoryRecordService.save(record);
            boolean success = goodsService.updateStock(item.getGoodsId(), diff);
            if (!success) {
                throw new RuntimeException("调整库存失败：货物「" + item.getGoodsName() + "」");
            }
        }

        stocktake.setStatus("CONFIRMED");
        stocktake.setConfirmerId(operatorId);
        stocktake.setConfirmerName(operatorName);
        stocktake.setConfirmedAt(LocalDateTime.now());
        updateById(stocktake);
    }
}
