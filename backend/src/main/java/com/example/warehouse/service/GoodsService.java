package com.example.warehouse.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.warehouse.entity.Goods;

public interface GoodsService extends IService<Goods> {
    /**
     * Update stock level
     * @param id goods id
     * @param quantity change amount (positive for in, negative for out)
     * @return success
     */
    boolean updateStock(Long id, Integer quantity);
}
