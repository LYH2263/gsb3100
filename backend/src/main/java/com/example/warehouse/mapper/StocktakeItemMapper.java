package com.example.warehouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.warehouse.entity.StocktakeItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface StocktakeItemMapper extends BaseMapper<StocktakeItem> {

    @Select("SELECT si.*, g.name as goods_name, g.code as goods_code, g.unit " +
            "FROM stocktake_items si LEFT JOIN goods g ON si.goods_id = g.id " +
            "WHERE si.order_id = #{orderId}")
    List<StocktakeItem> selectItemsWithGoodsInfo(@Param("orderId") Long orderId);
}
