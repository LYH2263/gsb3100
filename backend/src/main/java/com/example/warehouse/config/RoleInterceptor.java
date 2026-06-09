package com.example.warehouse.config;

import com.example.warehouse.dto.Result;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RoleInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String role = request.getHeader("X-User-Role");
        String path = request.getRequestURI();

        // Protect user management API
        if (path.startsWith("/api/users") || path.startsWith("/users")) {
            if (!"ADMIN".equals(role)) {
                response.setContentType("application/json;charset=UTF-8");
                Result<Object> result = Result.error("权限不足，仅管理员可操作");
                response.getWriter().write(new ObjectMapper().writeValueAsString(result));
                return false;
            }
        }

        if ((path.startsWith("/api/stocktakes") || path.startsWith("/stocktakes"))
                && "POST".equals(request.getMethod()) && path.endsWith("/confirm")) {
            if (!"ADMIN".equals(role)) {
                response.setContentType("application/json;charset=UTF-8");
                Result<Object> result = Result.error("权限不足，仅管理员可确认盘点");
                response.getWriter().write(new ObjectMapper().writeValueAsString(result));
                return false;
            }
        }
        
        return true;
    }
}
