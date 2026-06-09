package com.example.warehouse.controller;

import com.example.warehouse.aspect.Loggable;
import com.example.warehouse.dto.Result;
import com.example.warehouse.entity.StocktakeOrder;
import com.example.warehouse.service.StocktakeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stocktake")
public class StocktakeController {

    @Autowired
    private StocktakeService stocktakeService;

    @GetMapping
    public Result<List<StocktakeOrder>> list(@RequestParam(required = false) String status) {
        return Result.success(stocktakeService.listOrders(status));
    }

    @GetMapping("/{id}")
    public Result<StocktakeOrder> detail(@PathVariable Long id) {
        return Result.success(stocktakeService.getDetail(id));
    }

    @PostMapping
    @Loggable("创建盘点单")
    public Result<StocktakeOrder> create(@RequestBody StocktakeOrder order, HttpServletRequest request) {
        String username = request.getHeader("X-User-Name");
        order.setCreatorName(username);
        return Result.success(stocktakeService.createOrder(order, order.getCategoryId()));
    }

    @PutMapping("/item/{itemId}")
    @Loggable("录入实盘数量")
    public Result<Boolean> updateActualStock(@PathVariable Long itemId, @RequestBody Map<String, Integer> body) {
        Integer actualStock = body.get("actualStock");
        return Result.success(stocktakeService.updateActualStock(itemId, actualStock));
    }

    @PostMapping("/{id}/confirm")
    @Loggable("确认盘点单")
    public Result<Boolean> confirm(@PathVariable Long id, HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (!"ADMIN".equals(role)) {
            return Result.error("权限不足，仅管理员可确认盘点");
        }
        String username = request.getHeader("X-User-Name");
        return Result.success(stocktakeService.confirmOrder(id, null, username));
    }
}
