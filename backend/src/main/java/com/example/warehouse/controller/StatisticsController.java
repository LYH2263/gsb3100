package com.example.warehouse.controller;

import com.example.warehouse.dto.Result;
import com.example.warehouse.service.CategoryService;
import com.example.warehouse.service.GoodsService;
import com.example.warehouse.service.InventoryRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/statistics")
public class StatisticsController {

    @Autowired
    private GoodsService goodsService;
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private InventoryRecordService inventoryRecordService;

    @GetMapping("/summary")
    public Result<Map<String, Object>> summary() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalGoods", goodsService.count());
        data.put("totalCategories", categoryService.count());
        data.put("totalStock", goodsService.list().stream().mapToInt(g -> g.getStock()).sum());
        data.put("totalRecords", inventoryRecordService.count());
        return Result.success(data);
    }

    @GetMapping("/category-distribution")
    public Result<Object> categoryDistribution() {
        // Return mapping of category name to goods count
        Map<Long, String> categoryNames = categoryService.list().stream()
                .collect(Collectors.toMap(c -> c.getId(), c -> c.getName()));
        
        Map<String, Long> distribution = goodsService.list().stream()
                .collect(Collectors.groupingBy(g -> categoryNames.getOrDefault(g.getCategoryId(), "未分类"), Collectors.counting()));
        
        return Result.success(distribution.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey());
                    m.put("value", e.getValue());
                    return m;
                }).collect(Collectors.toList()));
    }
}
