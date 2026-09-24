package com.sms.dto;

import java.time.LocalDateTime;

public record ActivityLogResponse(
        Long id,
        String username,
        String userRole,
        String action,
        String targetType,
        Long targetId,
        String description,
        LocalDateTime createdAt
) {
}
