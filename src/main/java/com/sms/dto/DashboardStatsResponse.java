package com.sms.dto;

import java.util.List;
import java.util.Map;

public record DashboardStatsResponse(
        long totalStudents,
        long excellentStudents,
        long goodStudents,
        long averageStudents,
        List<FacultyStatItem> facultyStats,
        List<AcademicLevelItem> academicStats,
        StudentSummary highestGpaStudent,
        StudentSummary lowestGpaStudent,
        Map<String, Long> statusStats
) {
    public record FacultyStatItem(String faculty, long count) {
    }

    public record AcademicLevelItem(String label, long count) {
    }

    public record StudentSummary(String studentCode, String fullName, Double gpa) {
    }

    public record StatusStatItem(String status, long count, String colorVar) {
    }
}
