package com.example.warehouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.warehouse.entity.StocktakeOrderItem;
import com.example.warehouse.mapper.StocktakeOrderItemMapper;
import com.example.warehouse.service.StocktakeOrderItemService;
import org.springframework.stereotype.Service;

@Service
public class StocktakeOrderItemServiceImpl extends ServiceImpl<StocktakeOrderItemMapper, StocktakeOrderItem> implements StocktakeOrderItemService {
}
