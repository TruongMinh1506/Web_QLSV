package com.sms.controller;

import com.sms.dto.ActivityLogResponse;
import com.sms.model.ApiResponse;
import com.sms.model.UserRole;
import com.sms.service.ActivityLogService;
import com.sms.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class ActivityLogController {
    private final ActivityLogService activityLogService;
    private final AuthService authService;

    public ActivityLogController(ActivityLogService activityLogService, AuthService authService) {
        this.activityLogService = activityLogService;
        this.authService = authService;
    }

    @GetMapping
    public ApiResponse<List<ActivityLogResponse>> getLogs(HttpSession session) {
        authService.requireRole(session, UserRole.ADMIN);
        return ApiResponse.success("Lấy nhật ký hoạt động thành công", activityLogService.getRecentLogs());
    }
}
