package com.example.warehouse.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.warehouse.aspect.Loggable;
import com.example.warehouse.dto.Result;
import com.example.warehouse.entity.Stocktake;
import com.example.warehouse.service.StocktakeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stocktakes")
public class StocktakeController {

    @Autowired
    private StocktakeService stocktakeService;

    @GetMapping
    public Result<List<Stocktake>> list(@RequestParam(required = false) String status) {
        LambdaQueryWrapper<Stocktake> wrapper = new LambdaQueryWrapper<Stocktake>()
                .eq(status != null, Stocktake::getStatus, status)
                .orderByDesc(Stocktake::getCreatedAt);
        return Result.success(stocktakeService.list(wrapper));
    }

    @PostMapping
    @Loggable("创建盘点单")
    public Result<Stocktake> create(@RequestBody Stocktake stocktake, HttpServletRequest request) {
        try {
            String username = request.getHeader("X-User-Name");
            Long userId = 0L;
            stocktake.setCreatorId(userId);
            stocktake.setCreatorName(username);
            Stocktake created = stocktakeService.createStocktake(stocktake);
            return Result.success(created);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public Result<Stocktake> detail(@PathVariable Long id) {
        Stocktake stocktake = stocktakeService.getStocktakeDetail(id);
        if (stocktake == null) {
            return Result.error("盘点单不存在");
        }
        return Result.success(stocktake);
    }

    @PutMapping("/{id}/items")
    @Loggable("录入实盘数量")
    public Result<String> updateItems(@PathVariable Long id, @RequestBody List<Map<String, Object>> itemUpdates) {
        try {
            stocktakeService.updateItems(id, itemUpdates);
            return Result.success("保存成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/confirm")
    @Loggable("确认盘点")
    public Result<String> confirm(@PathVariable Long id, HttpServletRequest request) {
        try {
            String role = request.getHeader("X-User-Role");
            if (!"ADMIN".equals(role)) {
                return Result.error("权限不足，仅管理员可确认盘点");
            }
            String username = request.getHeader("X-User-Name");
            Long userId = 0L;
            stocktakeService.confirmStocktake(id, userId, username);
            return Result.success("盘点确认成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Loggable("删除盘点单")
    public Result<String> delete(@PathVariable Long id) {
        try {
            Stocktake stocktake = stocktakeService.getById(id);
            if (stocktake == null) {
                return Result.error("盘点单不存在");
            }
            if ("CONFIRMED".equals(stocktake.getStatus())) {
                return Result.error("已确认的盘点单不可删除");
            }
            stocktakeService.removeById(id);
            return Result.success("删除成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
