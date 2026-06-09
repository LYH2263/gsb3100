package com.example.warehouse.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.warehouse.entity.User;

public interface UserService extends IService<User> {
    User login(String username, String password);
}
