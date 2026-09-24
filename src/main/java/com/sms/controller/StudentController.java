package com.sms.controller;

import com.sms.dto.DashboardStatsResponse;
import com.sms.dto.FilterOptionsResponse;
import com.sms.dto.PageResponse;
import com.sms.dto.StudentRequest;
import com.sms.entity.Student;
import com.sms.entity.UserAccount;
import com.sms.model.ApiResponse;
import com.sms.model.UserRole;
import com.sms.service.ActivityLogService;
import com.sms.service.AuthService;
import com.sms.service.StudentService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService studentService;
    private final AuthService authService;
    private final ActivityLogService activityLogService;

    @Value("${app.student-page-size:10}")
    private int defaultPageSize;

    public StudentController(
            StudentService studentService,
            AuthService authService,
            ActivityLogService activityLogService
    ) {
        this.studentService = studentService;
        this.authService = authService;
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public ApiResponse<List<Student>> getStudents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String faculty,
            @RequestParam(required = false) String major,
            @RequestParam(required = false) String className,
            HttpSession session
    ) {
        authService.requireRole(session, UserRole.ADMIN, UserRole.TEACHER);
        return ApiResponse.success("Lấy danh sách sinh viên thành công", studentService.search(keyword, faculty, major, className));
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<Student>> getStudentsPaged(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String faculty,
            @RequestParam(required = false) String major,
            @RequestParam(required = false) String className,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "") String size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            HttpSession session
    ) {
        authService.requireRole(session, UserRole.ADMIN, UserRole.TEACHER);
        int pageSize = (size == null || size.isBlank()) ? defaultPageSize : Integer.parseInt(size);
        if (page < 0) page = 0;
        if (pageSize <= 0) pageSize = defaultPageSize;
        return ApiResponse.success("Lấy danh sách sinh viên (phân trang) thành công",
                studentService.search(keyword, faculty, major, className, page, pageSize, sortBy, sortDir));
    }

    @GetMapping("/filters")
    public ApiResponse<FilterOptionsResponse> getFilterOptions(HttpSession session) {
        authService.requireRole(session, UserRole.ADMIN, UserRole.TEACHER);
        return ApiResponse.success("Lấy tùy chọn lọc thành công", studentService.getFilterOptions());
    }

    @GetMapping(value = "/export", produces = "text/csv;charset=UTF-8")
    public ResponseEntity<byte[]> exportStudents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String faculty,
            @RequestParam(required = false) String major,
            @RequestParam(required = false) String className,
            HttpSession session
    ) {
        authService.requireRole(session, UserRole.ADMIN, UserRole.TEACHER);
        String csv = studentService.exportToCsv(keyword, faculty, major, className);
        byte[] bytes = ("\uFEFF" + csv).getBytes(StandardCharsets.UTF_8);
        String filename = "students_export_" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .body(bytes);
    }

    @GetMapping("/dashboard")
    public ApiResponse<DashboardStatsResponse> getDashboard(HttpSession session) {
        authService.requireRole(session, UserRole.ADMIN, UserRole.TEACHER);
        return ApiResponse.success("Lấy thống kê thành công", studentService.getDashboardStats());
    }

    @GetMapping("/me")
    public ApiResponse<Student> getCurrentStudent(HttpSession session) {
        UserAccount currentUser = authService.requireRole(session, UserRole.STUDENT);
        if (currentUser.getStudentId() == null) {
            throw new IllegalArgumentException("Tài khoản sinh viên chưa được gắn hồ sơ");
        }
        return ApiResponse.success("Lấy hồ sơ sinh viên thành công", studentService.getById(currentUser.getStudentId()));
    }

    @PostMapping
    public ApiResponse<Student> createStudent(@Valid @RequestBody StudentRequest request, HttpSession session) {
        UserAccount currentUser = authService.requireRole(session, UserRole.ADMIN);
        Student student = studentService.create(request);
        activityLogService.log(
                currentUser,
                "CREATE",
                "STUDENT",
                student.getId(),
                "Thêm sinh viên " + student.getStudentCode() + " - " + student.getFullName()
        );
        return ApiResponse.success("Thêm sinh viên thành công", student);
    }

    @PutMapping("/{id}")
    public ApiResponse<Student> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request,
            HttpSession session
    ) {
        UserAccount currentUser = authService.requireRole(session, UserRole.ADMIN);
        Student student = studentService.update(id, request);
        activityLogService.log(
                currentUser,
                "UPDATE",
                "STUDENT",
                student.getId(),
                "Cập nhật sinh viên " + student.getStudentCode() + " - " + student.getFullName()
        );
        return ApiResponse.success("Cập nhật sinh viên thành công", student);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteStudent(@PathVariable Long id, HttpSession session) {
        UserAccount currentUser = authService.requireRole(session, UserRole.ADMIN);
        Student student = studentService.delete(id);
        activityLogService.log(
                currentUser,
                "DELETE",
                "STUDENT",
                student.getId(),
                "Xóa sinh viên " + student.getStudentCode() + " - " + student.getFullName()
        );
        return ApiResponse.success("Xóa sinh viên thành công", null);
    }

    @DeleteMapping("/bulk")
    public ApiResponse<Void> deleteStudentsBulk(@RequestBody List<Long> ids, HttpSession session) {
        UserAccount currentUser = authService.requireRole(session, UserRole.ADMIN);
        List<Student> deleted = studentService.deleteAll(ids);
        activityLogService.log(
                currentUser,
                "DELETE",
                "STUDENT",
                null,
                "Xóa " + deleted.size() + " sinh viên"
        );
        return ApiResponse.success("Xóa " + deleted.size() + " sinh viên thành công", null);
    }
}
