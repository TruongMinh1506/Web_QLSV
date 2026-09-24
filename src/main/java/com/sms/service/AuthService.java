package com.sms.service;

import com.sms.dto.AuthUserResponse;
import com.sms.dto.ChangePasswordRequest;
import com.sms.dto.LoginRequest;
import com.sms.entity.UserAccount;
import com.sms.exception.ForbiddenException;
import com.sms.exception.UnauthorizedException;
import com.sms.model.UserRole;
import com.sms.repository.UserAccountRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;

@Service
public class AuthService {
    private static final String SESSION_USER_ID = "AUTH_USER_ID";

    private final UserAccountRepository userAccountRepository;

    public AuthService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public AuthUserResponse login(LoginRequest request, HttpSession session) {
        String username = request.getUsername().trim();
        String password = request.getPassword().trim();

        UserAccount user = userAccountRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new UnauthorizedException("Sai tài khoản hoặc mật khẩu"));

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new UnauthorizedException("Tài khoản đã bị khóa");
        }

        if (!user.getPassword().equals(password)) {
            throw new UnauthorizedException("Sai tài khoản hoặc mật khẩu");
        }

        session.setAttribute(SESSION_USER_ID, user.getId());
        session.setMaxInactiveInterval(60 * 60);
        return toResponse(user);
    }

    public AuthUserResponse getCurrentUser(HttpSession session) {
        return toResponse(requireUser(session));
    }

    public Optional<UserAccount> findCurrentUser(HttpSession session) {
        Object rawUserId = session.getAttribute(SESSION_USER_ID);
        if (!(rawUserId instanceof Number number)) {
            return Optional.empty();
        }

        return userAccountRepository.findById(number.longValue());
    }

    public UserAccount requireUser(HttpSession session) {
        return findCurrentUser(session)
                .orElseThrow(() -> new UnauthorizedException("Bạn cần đăng nhập để tiếp tục"));
    }

    public UserAccount requireRole(HttpSession session, UserRole... roles) {
        UserAccount user = requireUser(session);
        boolean matched = Arrays.stream(roles).anyMatch(role -> role == user.getRole());
        if (!matched) {
            throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này");
        }
        return user;
    }

    public boolean isAuthenticated(HttpSession session) {
        return findCurrentUser(session).isPresent();
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }

    public void changePassword(HttpSession session, ChangePasswordRequest request) {
        UserAccount user = requireUser(session);

        if (!user.getPassword().equals(request.getCurrentPassword().trim())) {
            throw new UnauthorizedException("Mật khẩu hiện tại không đúng");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        user.setPassword(request.getNewPassword());
        userAccountRepository.save(user);
    }

    private AuthUserResponse toResponse(UserAccount user) {
        return new AuthUserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                user.getStudentId()
        );
    }
}
