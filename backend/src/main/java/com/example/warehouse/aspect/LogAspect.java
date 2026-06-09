package com.example.warehouse.aspect;

import com.alibaba.fastjson2.JSON;
import com.example.warehouse.entity.OperationLog;
import com.example.warehouse.service.OperationLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.time.LocalDateTime;

@Aspect
@Component
public class LogAspect {

    @Autowired
    private OperationLogService operationLogService;

    @Pointcut("@annotation(com.example.warehouse.aspect.Loggable)")
    public void logPointcut() {}

    @AfterReturning(pointcut = "logPointcut()", returning = "result")
    public void doAfterReturning(JoinPoint joinPoint, Object result) {
        handleLog(joinPoint, null);
    }

    private void handleLog(JoinPoint joinPoint, Exception e) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            Loggable loggable = method.getAnnotation(Loggable.class);

            if (loggable == null) return;

            OperationLog log = new OperationLog();
            log.setOperation(loggable.value());
            log.setMethod(joinPoint.getTarget().getClass().getName() + "." + method.getName());
            log.setParams(JSON.toJSONString(joinPoint.getArgs()));
            
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                log.setIp(request.getRemoteAddr());
                String username = request.getHeader("X-User-Name");
                log.setUsername(username != null ? username : "unknown");
            }

            operationLogService.save(log);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
