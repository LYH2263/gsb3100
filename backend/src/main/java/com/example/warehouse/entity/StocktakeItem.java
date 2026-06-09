package com.example.warehouse.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("stocktake_items")
public class StocktakeItem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private Long goodsId;
    private Integer systemStock;
    private Integer actualStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField(exist = false)
    private String goodsName;
    @TableField(exist = false)
    private String goodsCode;
    @TableField(exist = false)
    private String unit;
    @TableField(exist = false)
    private Integer difference;
}
