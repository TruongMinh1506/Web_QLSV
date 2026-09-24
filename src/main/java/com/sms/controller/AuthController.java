package com.sms.controller;

import com.sms.dto.AuthUserResponse;
import com.sms.dto.ChangePasswordRequest;
import com.sms.dto.LoginRequest;
import com.sms.entity.UserAccount;
import com.sms.model.ApiResponse;
import com.sms.service.ActivityLogService;
import com.sms.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final ActivityLogService activityLogService;

    public AuthController(AuthService authService, ActivityLogService activityLogService) {
        this.authService = authService;
        this.activityLogService = activityLogService;
    }

    @PostMapping("/login")
    public ApiResponse<AuthUserResponse> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        AuthUserResponse currentUser = authService.login(request, session);
        activityLogService.log(
                currentUser.username(),
                currentUser.role(),
                "LOGIN",
                "AUTH",
                currentUser.id(),
                "Đăng nhập vào hệ thống"
        );
        return ApiResponse.success("Đăng nhập thành công", currentUser);
    }

    @GetMapping("/me")
    public ApiResponse<AuthUserResponse> me(HttpSession session) {
        return ApiResponse.success("Lấy thông tin người dùng thành công", authService.getCurrentUser(session));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpSession session) {
        authService.findCurrentUser(session).ifPresent(user ->
                activityLogService.log(user, "LOGOUT", "AUTH", user.getId(), "Đăng xuất khỏi hệ thống"));
        authService.logout(session);
        return ApiResponse.success("Đăng xuất thành công", null);
    }

    @PatchMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request, HttpSession session) {
        UserAccount currentUser = authService.requireUser(session);
        authService.changePassword(session, request);
        activityLogService.log(
                currentUser,
                "UPDATE",
                "AUTH",
                currentUser.getId(),
                "Đổi mật khẩu tài khoản"
        );
        return ApiResponse.success("Đổi mật khẩu thành công", null);
    }
}
