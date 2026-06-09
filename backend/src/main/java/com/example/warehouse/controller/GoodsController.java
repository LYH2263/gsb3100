package com.example.warehouse.controller;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.warehouse.aspect.Loggable;
import com.example.warehouse.dto.Result;
import com.example.warehouse.entity.Goods;
import com.example.warehouse.service.GoodsService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/goods")
public class GoodsController {

    @Autowired
    private GoodsService goodsService;

    @GetMapping
    public Result<List<Goods>> list(@RequestParam(required = false) String name,
                                   @RequestParam(required = false) Long categoryId) {
        LambdaQueryWrapper<Goods> wrapper = new LambdaQueryWrapper<Goods>()
                .like(name != null, Goods::getName, name)
                .eq(categoryId != null, Goods::getCategoryId, categoryId);
        return Result.success(goodsService.list(wrapper));
    }

    @PostMapping
    @Loggable("新货物")
    public Result<Boolean> save(@RequestBody Goods goods) {
        return Result.success(goodsService.save(goods));
    }

    @PutMapping
    @Loggable("更新货物")
    public Result<Boolean> update(@RequestBody Goods goods) {
        return Result.success(goodsService.updateById(goods));
    }

    @DeleteMapping("/{id}")
    @Loggable("删除货物")
    public Result<Boolean> remove(@PathVariable Long id) {
        return Result.success(goodsService.removeById(id));
    }

    @PostMapping("/batch-delete")
    @Loggable("批量删除货物")
    public Result<Boolean> batchDelete(@RequestBody List<Long> ids) {
        return Result.success(goodsService.removeByIds(ids));
    }

    @GetMapping("/export")
    @Loggable("导出货物数据")
    public void export(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("货物列表", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        
        List<Goods> list = goodsService.list();
        EasyExcel.write(response.getOutputStream(), Goods.class).sheet("货物数据").doWrite(list);
    }
}
