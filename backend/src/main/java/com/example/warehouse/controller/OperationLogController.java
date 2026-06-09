package com.example.warehouse.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.warehouse.dto.Result;
import com.example.warehouse.entity.OperationLog;
import com.example.warehouse.service.OperationLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/logs")
public class OperationLogController {

    @Autowired
    private OperationLogService operationLogService;

    @GetMapping
    public Result<List<OperationLog>> list() {
        return Result.success(operationLogService.list(
            new LambdaQueryWrapper<OperationLog>().orderByDesc(OperationLog::getCreatedAt)
        ));
    }
}
