package com.example.warehouse.service.impl;

import lombok.extern.slf4j.Slf4j;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.warehouse.entity.User;
import com.example.warehouse.mapper.UserMapper;
import com.example.warehouse.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User login(String username, String password) {
        log.info("Login attempt for user: {}", username);
        User user = this.getOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user != null) {
            boolean matches = passwordEncoder.matches(password, user.getPassword());
            log.info("User found, password matches: {}", matches);
            if (matches) {
                return user;
            }
        } else {
            log.warn("User not found: {}", username);
        }
        return null;
    }
}
