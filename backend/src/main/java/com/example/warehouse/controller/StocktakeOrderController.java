package com.example.warehouse.controller;

import com.example.warehouse.aspect.Loggable;
import com.example.warehouse.dto.Result;
import com.example.warehouse.entity.StocktakeOrder;
import com.example.warehouse.entity.StocktakeOrderItem;
import com.example.warehouse.service.StocktakeOrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stocktake")
public class StocktakeOrderController {

    @Autowired
    private StocktakeOrderService stocktakeOrderService;

    @GetMapping
    public Result<List<StocktakeOrder>> list() {
        return Result.success(stocktakeOrderService.list());
    }

    @GetMapping("/{id}")
    public Result<StocktakeOrder> getById(@PathVariable Long id) {
        return Result.success(stocktakeOrderService.getById(id));
    }

    @GetMapping("/{id}/items")
    public Result<List<StocktakeOrderItem>> getItems(@PathVariable Long id) {
        return Result.success(stocktakeOrderService.getItemsByOrderId(id));
    }

    @PostMapping
    @Loggable("创建盘点单")
    public Result<StocktakeOrder> create(@RequestBody Map<String, Object> params, HttpServletRequest request) {
        try {
            Long categoryId = params.get("categoryId") != null ? Long.valueOf(params.get("categoryId").toString()) : null;
            String remark = params.get("remark") != null ? params.get("remark").toString() : null;
            String userName = request.getHeader("X-User-Name");
            StocktakeOrder order = stocktakeOrderService.createOrder(categoryId, remark, 0L, userName);
            return Result.success(order);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/items/{itemId}")
    @Loggable("录入实盘数量")
    public Result<String> updateActualStock(@PathVariable Long itemId, @RequestBody Map<String, Object> params) {
        try {
            Integer actualStock = params.get("actualStock") != null ? Integer.valueOf(params.get("actualStock").toString()) : null;
            stocktakeOrderService.updateActualStock(itemId, actualStock);
            return Result.success("更新成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/confirm")
    @Loggable("确认盘点")
    public Result<String> confirm(@PathVariable Long id, HttpServletRequest request) {
        try {
            String userName = request.getHeader("X-User-Name");
            stocktakeOrderService.confirmOrder(id, 0L, userName);
            return Result.success("确认成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Loggable("删除盘点单")
    public Result<String> delete(@PathVariable Long id) {
        try {
            stocktakeOrderService.deleteOrder(id);
            return Result.success("删除成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
