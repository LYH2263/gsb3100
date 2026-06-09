package com.example.warehouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.warehouse.entity.Goods;
import com.example.warehouse.mapper.GoodsMapper;
import com.example.warehouse.service.GoodsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoodsServiceImpl extends ServiceImpl<GoodsMapper, Goods> implements GoodsService {

    @Override
    @Transactional
    public boolean updateStock(Long id, Integer quantity) {
        Goods goods = getById(id);
        if (goods == null) return false;
        
        int newStock = goods.getStock() + quantity;
        if (newStock < 0) {
            throw new RuntimeException("库存不足");
        }
        
        goods.setStock(newStock);
        return updateById(goods);
    }
}
