package com.sms.dto;

import com.sms.model.UserRole;

public record AuthUserResponse(
        Long id,
        String username,
        String fullName,
        UserRole role,
        Long studentId
) {
}
