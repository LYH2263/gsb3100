package com.example.warehouse.controller;

import com.example.warehouse.aspect.Loggable;
import com.example.warehouse.dto.Result;
import com.example.warehouse.entity.User;
import com.example.warehouse.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    @Loggable("用户登录")
    public Result<User> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");
        User user = userService.login(username, password);
        if (user != null) {
            return Result.success(user);
        }
        return Result.error("用户名或密码错误");
    }
}

@RestController
@RequestMapping("/users")
class UserController {
    @Autowired
    private UserService userService;

    @GetMapping
    public Result<List<User>> list() {
        return Result.success(userService.list());
    }

    @PostMapping
    @Loggable("新增用户")
    public Result<Boolean> save(@RequestBody User user) {
        return Result.success(userService.save(user));
    }

    @DeleteMapping("/{id}")
    @Loggable("删除用户")
    public Result<Boolean> remove(@PathVariable Long id) {
        return Result.success(userService.removeById(id));
    }
}
