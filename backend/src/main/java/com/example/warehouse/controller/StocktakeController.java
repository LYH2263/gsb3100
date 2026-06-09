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
@RequestMapping("/stocktakes")
public class StocktakeController {

    @Autowired
    private StocktakeService stocktakeService;

    @GetMapping
    public Result<List<StocktakeOrder>> list() {
        return Result.success(stocktakeService.listOrders());
    }

    @GetMapping("/{id}")
    public Result<StocktakeOrder> detail(@PathVariable Long id) {
        return Result.success(stocktakeService.getDetail(id));
    }

    @PostMapping
    @Loggable("创建盘点单")
    public Result<StocktakeOrder> create(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        try {
            Long categoryId = body.get("categoryId") == null ? null : Long.valueOf(body.get("categoryId").toString());
            String remark = body.get("remark") == null ? null : body.get("remark").toString();
            String userIdStr = request.getHeader("X-User-Id");
            Long userId = userIdStr == null ? 0L : Long.valueOf(userIdStr);
            String userName = request.getHeader("X-User-Name");
            return Result.success(stocktakeService.createOrder(categoryId, remark, userId,
                    userName == null ? "unknown" : userName));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/items/{itemId}")
    @Loggable("录入盘点实盘")
    public Result<String> updateItem(@PathVariable Long itemId, @RequestBody Map<String, Object> body) {
        try {
            Object qty = body.get("actualQty");
            Integer actual = qty == null ? null : Integer.valueOf(qty.toString());
            stocktakeService.updateActualQty(itemId, actual);
            return Result.success("已保存");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/confirm")
    @Loggable("确认盘点单")
    public Result<String> confirm(@PathVariable Long id, HttpServletRequest request) {
        try {
            String role = request.getHeader("X-User-Role");
            if (!"ADMIN".equals(role)) {
                return Result.error("权限不足，仅管理员可确认盘点单");
            }
            String userIdStr = request.getHeader("X-User-Id");
            Long userId = userIdStr == null ? 0L : Long.valueOf(userIdStr);
            String userName = request.getHeader("X-User-Name");
            stocktakeService.confirmOrder(id, userId, userName == null ? "unknown" : userName);
            return Result.success("确认成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
