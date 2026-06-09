package com.example.warehouse.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("stocktakes")
public class Stocktake {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String status;
    private Long categoryId;
    private Long creatorId;
    private String creatorName;
    private Long confirmerId;
    private String confirmerName;
    private LocalDateTime confirmedAt;
    private LocalDateTime createdAt;

    @TableField(exist = false)
    private List<StocktakeItem> items;

    @TableField(exist = false)
    private String categoryName;
}
