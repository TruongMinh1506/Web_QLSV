SET NAMES utf8mb4;
USE StudentManagementDB;

INSERT INTO students (student_code, full_name, date_of_birth, class_name, major, faculty, gpa, status) VALUES
('SV001', 'Nguyễn Hoàng An', '2004-02-10', 'CNTT-K18A', 'Kỹ thuật phần mềm', 'Công nghệ thông tin', 3.56, 'Đang học'),
('SV002', 'Trần Minh Châu', '2003-11-21', 'QTKD-K17B', 'Quản trị kinh doanh', 'Kinh tế', 3.04, 'Đang học'),
('SV003', 'Lê Bảo Khánh', '2004-07-05', 'DTVT-K18A', 'Điện tử viễn thông', 'Điện - Điện tử', 2.56, 'Bảo lưu'),
('SV004', 'Phạm Thu Hà', '2004-01-18', 'CNTT-K18B', 'Hệ thống thông tin', 'Công nghệ thông tin', 3.24, 'Đang học'),
('SV005', 'Vũ Đức Long', '2003-09-09', 'KT-K17A', 'Kế toán', 'Tài chính - Kế toán', 2.76, 'Đang học'),
('SV006', 'Đỗ Minh Quân', '2004-03-12', 'CNTT-K18A', 'Kỹ thuật phần mềm', 'Công nghệ thông tin', 3.40, 'Đang học'),
('SV007', 'Nguyễn Thúy Vi', '2004-05-25', 'CNTT-K18B', 'Hệ thống thông tin', 'Công nghệ thông tin', 3.12, 'Đang học'),
('SV008', 'Trần Văn Tú', '2003-12-01', 'QTKD-K17B', 'Quản trị kinh doanh', 'Kinh tế', 2.48, 'Bảo lưu'),
('SV009', 'Hoàng Lan Anh', '2004-08-14', 'DTVT-K18A', 'Điện tử viễn thông', 'Điện - Điện tử', 3.64, 'Đang học'),
('SV010', 'Lý Hải Nam', '2003-10-30', 'KT-K17A', 'Kế toán', 'Tài chính - Kế toán', 2.96, 'Đang học'),
('SV011', 'Phan Thanh Bình', '2004-01-05', 'CNTT-K18A', 'Kỹ thuật phần mềm', 'Công nghệ thông tin', 3.28, 'Đang học'),
('SV012', 'Ngô Mỹ Linh', '2004-11-19', 'QTKD-K17C', 'Quản trị kinh doanh', 'Kinh tế', 3.16, 'Đang học'),
('SV013', 'Bùi Xuân Trường', '2003-07-22', 'DTVT-K18A', 'Điện tử viễn thông', 'Điện - Điện tử', 2.32, 'Cảnh cáo'),
('SV014', 'Đặng Thu Thảo', '2004-04-08', 'CNTT-K18B', 'Hệ thống thông tin', 'Công nghệ thông tin', 3.80, 'Đang học'),
('SV015', 'Trịnh Công Sơn', '2003-02-28', 'KT-K17B', 'Kế toán', 'Tài chính - Kế toán', 2.68, 'Đang học'),
('SV016', 'Vương Minh Tuyết', '2004-09-15', 'CNTT-K18C', 'An toàn thông tin', 'Công nghệ thông tin', 3.52, 'Đang học'),
('SV017', 'Tạ Quang Khải', '2003-06-10', 'QTKD-K17B', 'Quản trị kinh doanh', 'Kinh tế', 2.84, 'Đang học'),
('SV018', 'Lê Thị Mai', '2004-12-03', 'DTVT-K18B', 'Điện tử viễn thông', 'Điện - Điện tử', 3.32, 'Đang học'),
('SV019', 'Nguyễn Đức Huy', '2004-02-20', 'CNTT-K18A', 'Kỹ thuật phần mềm', 'Công nghệ thông tin', 2.60, 'Đang học'),
('SV020', 'Phạm Bảo Ngọc', '2003-05-14', 'KT-K17A', 'Kế toán', 'Tài chính - Kế toán', 3.68, 'Đang học');

INSERT INTO users (username, password, full_name, role, student_id, enabled) VALUES
('admin', 'admin123', 'Quản trị viên', 'ADMIN', NULL, 1),
('teacher', 'teacher123', 'Giảng viên demo', 'TEACHER', NULL, 1),
('student', 'student123', 'Sinh viên demo', 'STUDENT', 1, 1);
