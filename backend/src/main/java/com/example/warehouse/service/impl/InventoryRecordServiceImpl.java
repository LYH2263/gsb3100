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
        save(record);

        int stockChange;
        switch (record.getType()) {
            case "IN":
                stockChange = record.getQuantity();
                break;
            case "OUT":
                stockChange = -record.getQuantity();
                break;
            case "ADJUST":
                stockChange = record.getQuantity();
                break;
            default:
                throw new RuntimeException("未知记录类型: " + record.getType());
        }

        boolean success = goodsService.updateStock(record.getGoodsId(), stockChange);

        if (!success) {
            throw new RuntimeException("更新库存失败");
        }
    }
}
