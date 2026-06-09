package com.example.warehouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.warehouse.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
