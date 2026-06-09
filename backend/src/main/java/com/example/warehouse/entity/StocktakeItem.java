package com.example.warehouse.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("stocktake_items")
public class StocktakeItem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private Long goodsId;
    private String goodsName;
    private String goodsCode;
    private Integer systemQty; // 创建时基准库存
    private Integer actualQty; // 实盘数量
    private Integer diff;      // actualQty - systemQty
}
