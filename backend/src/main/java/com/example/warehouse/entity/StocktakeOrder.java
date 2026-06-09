package com.example.warehouse.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("stocktake_orders")
public class StocktakeOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private String status;
    private Long categoryId;
    private String remark;
    private Long creatorId;
    private String creatorName;
    private Long confirmerId;
    private String confirmerName;
    private LocalDateTime confirmedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField(exist = false)
    private String categoryName;

    @TableField(exist = false)
    private List<StocktakeItem> items;
}
