package com.example.warehouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.warehouse.entity.InventoryRecord;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface InventoryRecordMapper extends BaseMapper<InventoryRecord> {
}
