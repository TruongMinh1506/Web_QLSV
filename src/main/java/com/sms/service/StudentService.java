package com.sms.service;

import com.sms.dto.DashboardStatsResponse;
import com.sms.dto.FilterOptionsResponse;
import com.sms.dto.PageResponse;
import com.sms.dto.StudentRequest;
import com.sms.entity.Student;
import com.sms.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StudentService {
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "studentCode", "fullName", "className", "major", "faculty", "gpa", "dateOfBirth"
    );

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> search(String keyword) {
        return search(keyword, null, null, null);
    }

    public List<Student> search(String keyword, String faculty, String major, String className) {
        Specification<Student> spec = buildSpecification(keyword, faculty, major, className);
        return studentRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "id"));
    }

    public PageResponse<Student> search(String keyword, int page, int size) {
        return search(keyword, null, null, null, page, size);
    }

    public PageResponse<Student> search(String keyword, String faculty, String major, String className, int page, int size) {
        return search(keyword, faculty, major, className, page, size, "id", "desc");
    }

    public PageResponse<Student> search(String keyword, String faculty, String major, String className, int page, int size, String sortBy, String sortDir) {
        Specification<Student> spec = buildSpecification(keyword, faculty, major, className);
        String safeSortBy = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "id";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, safeSortBy));
        Page<Student> studentPage = studentRepository.findAll(spec, pageable);
        return toPageResponse(studentPage);
    }

    private PageResponse<Student> toPageResponse(Page<Student> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.isEmpty()
        );
    }

    public Student getById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sinh viên"));
    }

    public Student create(StudentRequest request) {
        validateStudentCode(request.getStudentCode(), null);
        Student student = mapToEntity(new Student(), request);
        return studentRepository.save(student);
    }

    public Student update(Long id, StudentRequest request) {
        Student student = getById(id);
        validateStudentCode(request.getStudentCode(), id);
        mapToEntity(student, request);
        return studentRepository.save(student);
    }

    public Student delete(Long id) {
        Student student = getById(id);
        studentRepository.delete(student);
        return student;
    }

    public List<Student> deleteAll(Iterable<Long> ids) {
        List<Student> deleted = new ArrayList<>();
        for (Long id : ids) {
            Student student = getById(id);
            studentRepository.delete(student);
            deleted.add(student);
        }
        return deleted;
    }

    public DashboardStatsResponse getDashboardStats() {
        List<Student> students = studentRepository.findAll();

        long excellentStudents = students.stream().filter(student -> student.getGpa() >= 8.0).count();
        long goodStudents = students.stream().filter(student -> student.getGpa() >= 6.5 && student.getGpa() < 8.0).count();
        long averageStudents = students.stream().filter(student -> student.getGpa() < 6.5).count();

        Map<String, Long> facultyGrouped = students.stream()
                .collect(Collectors.groupingBy(Student::getFaculty, Collectors.counting()));

        List<DashboardStatsResponse.FacultyStatItem> facultyStats = facultyGrouped.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> new DashboardStatsResponse.FacultyStatItem(entry.getKey(), entry.getValue()))
                .toList();

        List<DashboardStatsResponse.AcademicLevelItem> academicStats = List.of(
                new DashboardStatsResponse.AcademicLevelItem("Giỏi", excellentStudents),
                new DashboardStatsResponse.AcademicLevelItem("Khá", goodStudents),
                new DashboardStatsResponse.AcademicLevelItem("Trung bình", averageStudents)
        );

        DashboardStatsResponse.StudentSummary highestGpa = students.stream()
                .max(Comparator.comparing(Student::getGpa))
                .map(s -> new DashboardStatsResponse.StudentSummary(s.getStudentCode(), s.getFullName(), s.getGpa()))
                .orElse(null);

        DashboardStatsResponse.StudentSummary lowestGpa = students.stream()
                .min(Comparator.comparing(Student::getGpa))
                .map(s -> new DashboardStatsResponse.StudentSummary(s.getStudentCode(), s.getFullName(), s.getGpa()))
                .orElse(null);

        Map<String, Long> statusStats = students.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getStatus() != null ? s.getStatus().trim() : "Không xác định",
                        Collectors.counting()));

        return new DashboardStatsResponse(
                students.size(),
                excellentStudents,
                goodStudents,
                averageStudents,
                facultyStats,
                academicStats,
                highestGpa,
                lowestGpa,
                statusStats
        );
    }

    private void validateStudentCode(String studentCode, Long currentId) {
        studentRepository.findByStudentCode(studentCode)
                .filter(student -> !student.getId().equals(currentId))
                .ifPresent(student -> {
                    throw new IllegalArgumentException("Mã sinh viên đã tồn tại");
                });
    }

    public FilterOptionsResponse getFilterOptions() {
        List<String> faculties = studentRepository.findDistinctFaculties();
        List<String> majors = studentRepository.findDistinctMajors();
        List<String> classes = studentRepository.findDistinctClassNames();
        return new FilterOptionsResponse(faculties, majors, classes);
    }

    public String exportToCsv(String keyword, String faculty, String major, String className) {
        List<Student> students = search(keyword, faculty, major, className);
        StringBuilder sb = new StringBuilder();
        sb.append("Mã sinh viên,Họ tên,Ngày sinh,Lớp,Chuyên ngành,Khoa,GPA,Trạng thái\n");
        for (Student s : students) {
            sb.append(csvEscape(s.getStudentCode())).append(",")
                    .append(csvEscape(s.getFullName())).append(",")
                    .append(s.getDateOfBirth()).append(",")
                    .append(csvEscape(s.getClassName())).append(",")
                    .append(csvEscape(s.getMajor())).append(",")
                    .append(csvEscape(s.getFaculty())).append(",")
                    .append(s.getGpa()).append(",")
                    .append(csvEscape(s.getStatus())).append("\n");
        }
        return sb.toString();
    }

    private String csvEscape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private Specification<Student> buildSpecification(String keyword, String faculty, String major, String className) {
        Specification<Student> spec = Specification.where(null);

        if (keyword != null && !keyword.isBlank()) {
            String kw = "%" + keyword.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("studentCode")), kw),
                    cb.like(cb.lower(root.get("fullName")), kw),
                    cb.like(cb.lower(root.get("className")), kw),
                    cb.like(cb.lower(root.get("faculty")), kw),
                    cb.like(cb.lower(root.get("major")), kw)
            ));
        }

        if (faculty != null && !faculty.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("faculty"), faculty));
        }

        if (major != null && !major.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("major"), major));
        }

        if (className != null && !className.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("className"), className));
        }

        return spec;
    }

    private Student mapToEntity(Student student, StudentRequest request) {
        student.setStudentCode(request.getStudentCode().trim().toUpperCase());
        student.setFullName(request.getFullName().trim());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setClassName(request.getClassName().trim());
        student.setMajor(request.getMajor().trim());
        student.setFaculty(request.getFaculty().trim());
        student.setGpa(request.getGpa());
        student.setStatus(request.getStatus().trim());
        return student;
    }
}
