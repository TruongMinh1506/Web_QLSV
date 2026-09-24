package com.sms.service;

import com.sms.dto.ActivityLogResponse;
import com.sms.entity.ActivityLog;
import com.sms.entity.UserAccount;
import com.sms.model.UserRole;
import com.sms.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {
    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public void log(UserAccount user, String action, String targetType, Long targetId, String description) {
        log(user.getUsername(), user.getRole(), action, targetType, targetId, description);
    }

    public void log(String username, UserRole role, String action, String targetType, Long targetId, String description) {
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUsername(username);
        activityLog.setUserRole(role.name());
        activityLog.setAction(action);
        activityLog.setTargetType(targetType);
        activityLog.setTargetId(targetId);
        activityLog.setDescription(description);
        activityLogRepository.save(activityLog);
    }

    public List<ActivityLogResponse> getRecentLogs() {
        return activityLogRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .map(log -> new ActivityLogResponse(
                        log.getId(),
                        log.getUsername(),
                        log.getUserRole(),
                        log.getAction(),
                        log.getTargetType(),
                        log.getTargetId(),
                        log.getDescription(),
                        log.getCreatedAt()
                ))
                .toList();
    }
}
