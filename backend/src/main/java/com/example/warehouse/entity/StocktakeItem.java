package com.example.warehouse.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("stocktake_items")
public class StocktakeItem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long stocktakeId;
    private Long goodsId;
    private String goodsName;
    private String goodsCode;
    private Integer systemStock;
    private Integer actualStock;
    private Integer difference;
    private String unit;
    private LocalDateTime createdAt;
}
