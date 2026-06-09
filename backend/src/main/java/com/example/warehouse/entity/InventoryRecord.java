package com.example.warehouse.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("inventory_records")
public class InventoryRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long goodsId;
    private String type; // IN or OUT
    private Integer quantity;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime createdAt;
}
