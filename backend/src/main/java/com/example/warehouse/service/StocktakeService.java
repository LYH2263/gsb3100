package com.example.warehouse.service;

import com.example.warehouse.entity.StocktakeOrder;

import java.util.List;

public interface StocktakeService {
    /** 创建盘点单（按分类筛选并快照基准库存） */
    StocktakeOrder createOrder(Long categoryId, String remark, Long creatorId, String creatorName);

    /** 列表（含明细汇总信息） */
    List<StocktakeOrder> listOrders();

    /** 获取盘点单详情（含明细） */
    StocktakeOrder getDetail(Long orderId);

    /** 录入实盘（仅草稿态） */
    void updateActualQty(Long itemId, Integer actualQty);

    /** 确认盘点（仅管理员）：差异写入 ADJUST 流水并调整库存 */
    void confirmOrder(Long orderId, Long confirmerId, String confirmerName);
}
