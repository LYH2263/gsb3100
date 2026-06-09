package com.example.warehouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.warehouse.entity.Stocktake;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface StocktakeMapper extends BaseMapper<Stocktake> {
}
