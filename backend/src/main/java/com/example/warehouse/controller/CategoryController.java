package com.example.warehouse.controller;

import com.example.warehouse.aspect.Loggable;
import com.example.warehouse.dto.Result;
import com.example.warehouse.entity.Category;
import com.example.warehouse.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public Result<List<Category>> list() {
        return Result.success(categoryService.list());
    }

    @PostMapping
    @Loggable("新增分类")
    public Result<Boolean> save(@RequestBody Category category) {
        return Result.success(categoryService.save(category));
    }

    @PutMapping
    @Loggable("更新分类")
    public Result<Boolean> update(@RequestBody Category category) {
        return Result.success(categoryService.updateById(category));
    }

    @DeleteMapping("/{id}")
    @Loggable("删除分类")
    public Result<Boolean> remove(@PathVariable Long id) {
        return Result.success(categoryService.removeById(id));
    }
}
