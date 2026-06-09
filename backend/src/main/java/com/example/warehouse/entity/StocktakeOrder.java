package com.example.warehouse.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("stocktake_orders")
public class StocktakeOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long categoryId;
    private String status;
    private Long creatorId;
    private String creatorName;
    private Long confirmerId;
    private String confirmerName;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
}
