package com.example.warehouse.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.warehouse.entity.StocktakeOrder;

import java.util.List;

public interface StocktakeService extends IService<StocktakeOrder> {

    StocktakeOrder createOrder(StocktakeOrder order, Long categoryId);

    boolean updateActualStock(Long itemId, Integer actualStock);

    boolean confirmOrder(Long orderId, Long confirmerId, String confirmerName);

    StocktakeOrder getDetail(Long id);

    List<StocktakeOrder> listOrders(String status);
}
