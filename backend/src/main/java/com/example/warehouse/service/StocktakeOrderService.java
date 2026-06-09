package com.example.warehouse.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.warehouse.entity.StocktakeOrder;
import com.example.warehouse.entity.StocktakeOrderItem;

import java.util.List;

public interface StocktakeOrderService extends IService<StocktakeOrder> {
    StocktakeOrder createOrder(Long categoryId, String remark, Long creatorId, String creatorName);

    List<StocktakeOrderItem> getItemsByOrderId(Long orderId);

    void updateActualStock(Long itemId, Integer actualStock);

    void confirmOrder(Long orderId, Long confirmerId, String confirmerName);

    void deleteOrder(Long orderId);
}
