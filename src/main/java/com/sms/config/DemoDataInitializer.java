package com.sms.config;

import com.sms.entity.Student;
import com.sms.entity.UserAccount;
import com.sms.model.UserRole;
import com.sms.repository.StudentRepository;
import com.sms.repository.UserAccountRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DemoDataInitializer {
    @Bean
    ApplicationRunner seedDemoUsers(
            JdbcTemplate jdbcTemplate,
            UserAccountRepository userAccountRepository,
            StudentRepository studentRepository
    ) {
        return args -> {
            ensureUnicodeColumns(jdbcTemplate);
            repairActivityLogs(jdbcTemplate);

            Long studentId = studentRepository.findByStudentCode("SV001")
                    .map(Student::getId)
                    .orElseGet(() -> studentRepository.findAll().stream()
                            .findFirst()
                            .map(Student::getId)
                            .orElse(null));

            upsertUser(userAccountRepository, "admin", "admin123", "Quản trị viên", UserRole.ADMIN, null);
            upsertUser(userAccountRepository, "teacher", "teacher123", "Giảng viên demo", UserRole.TEACHER, null);
            upsertUser(userAccountRepository, "student", "student123", "Sinh viên demo", UserRole.STUDENT, studentId);
        };
    }

    private void upsertUser(
            UserAccountRepository userAccountRepository,
            String username,
            String password,
            String fullName,
            UserRole role,
            Long studentId
    ) {
        UserAccount user = userAccountRepository.findByUsernameIgnoreCase(username)
                .orElseGet(UserAccount::new);

        user.setUsername(username);
        user.setPassword(password);
        user.setFullName(fullName);
        user.setRole(role);
        user.setStudentId(studentId);
        user.setEnabled(true);
        userAccountRepository.save(user);
    }

    private void ensureUnicodeColumns(JdbcTemplate jdbcTemplate) {
        jdbcTemplate.execute("""
                SET NAMES utf8mb4;
                """);
    }

    private void repairActivityLogs(JdbcTemplate jdbcTemplate) {
    }
}
