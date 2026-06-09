package com.example.warehouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.warehouse.entity.StocktakeItem;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface StocktakeItemMapper extends BaseMapper<StocktakeItem> {
}
