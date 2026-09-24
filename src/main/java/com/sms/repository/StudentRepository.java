package com.sms.repository;

import com.sms.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long>, JpaSpecificationExecutor<Student> {
    boolean existsByStudentCode(String studentCode);

    Optional<Student> findByStudentCode(String studentCode);

    @Query("""
            select s from Student s
            where lower(s.studentCode) like lower(concat('%', :keyword, '%'))
               or lower(s.fullName) like lower(concat('%', :keyword, '%'))
               or lower(s.className) like lower(concat('%', :keyword, '%'))
               or lower(s.faculty) like lower(concat('%', :keyword, '%'))
               or lower(s.major) like lower(concat('%', :keyword, '%'))
            order by s.id desc
            """)
    List<Student> search(String keyword);

    @Query("""
            select s from Student s
            where lower(s.studentCode) like lower(concat('%', :keyword, '%'))
               or lower(s.fullName) like lower(concat('%', :keyword, '%'))
               or lower(s.className) like lower(concat('%', :keyword, '%'))
               or lower(s.faculty) like lower(concat('%', :keyword, '%'))
               or lower(s.major) like lower(concat('%', :keyword, '%'))
            order by s.id desc
            """)
    Page<Student> search(String keyword, Pageable pageable);

    @Query("SELECT DISTINCT s.faculty FROM Student s ORDER BY s.faculty ASC")
    List<String> findDistinctFaculties();

    @Query("SELECT DISTINCT s.major FROM Student s ORDER BY s.major ASC")
    List<String> findDistinctMajors();

    @Query("SELECT DISTINCT s.className FROM Student s ORDER BY s.className ASC")
    List<String> findDistinctClassNames();
}
