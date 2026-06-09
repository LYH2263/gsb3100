package com.example.warehouse.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.warehouse.entity.InventoryRecord;

public interface InventoryRecordService extends IService<InventoryRecord> {
    /**
     * Record inventory operation and update stock
     * @param record inventory record
     */
    void saveRecordAndUpdateStock(InventoryRecord record);
}
