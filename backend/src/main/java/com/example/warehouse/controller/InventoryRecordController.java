package com.example.warehouse.controller;

import com.example.warehouse.aspect.Loggable;
import com.example.warehouse.dto.Result;
import com.example.warehouse.entity.InventoryRecord;
import com.example.warehouse.service.InventoryRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/records")
public class InventoryRecordController {

    @Autowired
    private InventoryRecordService inventoryRecordService;

    @GetMapping
    public Result<List<InventoryRecord>> list() {
        return Result.success(inventoryRecordService.list());
    }

    @PostMapping
    @Loggable("出入库操作")
    public Result<String> addRecord(@RequestBody InventoryRecord record, jakarta.servlet.http.HttpServletRequest request) {
        try {
            inventoryRecordService.saveRecordAndUpdateStock(record);
            return Result.success("操作成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
