package com.example.warehouse.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.warehouse.entity.Stocktake;

import java.util.List;
import java.util.Map;

public interface StocktakeService extends IService<Stocktake> {
    Stocktake createStocktake(Stocktake stocktake);

    Stocktake getStocktakeDetail(Long id);

    void updateItems(Long stocktakeId, List<Map<String, Object>> itemUpdates);

    void confirmStocktake(Long stocktakeId, Long operatorId, String operatorName);
}
