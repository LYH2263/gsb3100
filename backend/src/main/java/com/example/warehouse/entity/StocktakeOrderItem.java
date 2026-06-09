package com.example.warehouse.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("stocktake_order_items")
public class StocktakeOrderItem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private Long goodsId;
    private String goodsName;
    private String goodsCode;
    private Integer systemStock;
    private Integer actualStock;
    private Integer diffQuantity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
