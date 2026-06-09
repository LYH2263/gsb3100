package com.example.warehouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.warehouse.entity.InventoryRecord;
import com.example.warehouse.mapper.InventoryRecordMapper;
import com.example.warehouse.service.GoodsService;
import com.example.warehouse.service.InventoryRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryRecordServiceImpl extends ServiceImpl<InventoryRecordMapper, InventoryRecord> implements InventoryRecordService {

    @Autowired
    private GoodsService goodsService;

    @Override
    @Transactional
    public void saveRecordAndUpdateStock(InventoryRecord record) {
        // Save record
        save(record);
        
        // Update goods stock: IN/正向，OUT/反向；ADJUST 按 quantity 正负直接调整
        int quantity;
        if ("IN".equals(record.getType())) {
            quantity = record.getQuantity();
        } else if ("OUT".equals(record.getType())) {
            quantity = -record.getQuantity();
        } else {
            quantity = record.getQuantity();
        }
        boolean success = goodsService.updateStock(record.getGoodsId(), quantity);
        
        if (!success) {
            throw new RuntimeException("更新库存失败");
        }
    }
}
