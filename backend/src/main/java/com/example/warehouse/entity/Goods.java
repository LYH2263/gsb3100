package com.example.warehouse.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("goods")
public class Goods {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String code;
    private Long categoryId;
    private Integer stock;
    private String unit;
    private BigDecimal price;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
