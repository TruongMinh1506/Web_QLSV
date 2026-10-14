# Student Management Dashboard - Folder 5

Dự án `5` là một hệ thống quản lý sinh viên full-stack gồm:

- Backend: Java Spring Boot 3
- Database: MySQL 8.0 (cấu hình root/123456)
- Frontend: HTML, CSS, JavaScript thuần, được serve trực tiếp từ Spring Boot

## Chức năng

- Hiển thị dashboard quản lý sinh viên theo giao diện mẫu.
- Tìm kiếm sinh viên theo mã, tên, lớp, khoa, chuyên ngành.
- Thêm, sửa, xóa sinh viên.
- Đăng nhập hệ thống với 3 role: `ADMIN`, `TEACHER`, `STUDENT`.
- Phân quyền:
  - `ADMIN`: toàn quyền với dữ liệu sinh viên và xem nhật ký hoạt động.
  - `TEACHER`: chỉ được xem danh sách và thống kê.
  - `STUDENT`: chỉ được xem hồ sơ cá nhân.
- Ghi log hoạt động cơ bản cho `LOGIN`, `LOGOUT`, `CREATE`, `UPDATE`, `DELETE`.
- Thống kê tổng sinh viên, học lực và số lượng theo khoa.
- Thống kê trạng thái sinh viên (chuyển đổi, nghỉ viện, tốt nghiệp...) dưới dạng biểu đồ donut.

## Cấu trúc

```text
5/
  backend/
    pom.xml
    src/main/java/com/sms/...
    src/main/resources/
      application.properties
      static/
        index.html
        login.html
        assets/css/style.css
        assets/js/app.js
        assets/js/login.js
  database/
    schema.sql
    seed.sql
```

## Hướng dẫn chạy

### 1. Cài đặt và khởi động MySQL

- Cài đặt [MySQL 8.0](https://dev.mysql.com/downloads/mysql/) hoặc mở rộng MySQL từ [MySQL Installer](https://dev.mysql.com/downloads/installer/).
- Đảm bảo MySQL đang chạy (service `MySQL80`).
- Tài khoản mặc định: `root` / `123456`. Nếu dùng mật khẩu khác, cập nhật lại `application.properties`.

Tải MySQL client (nếu chưa có) vào PATH hoặc dùng đường dẫn tuyệt đối tới `mysql.exe` (thường nằm ở `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`).

### 2. Tạo database bằng mysql command line

Mở CMD, chạy thứ tự:

```cmd
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database\schema.sql
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database\seed.sql
```

### 3. Cấu hình kết nối

Nếu cần dùng tài khoản mật khẩu khác, sửa file `backend/src/main/resources/application.properties`:

- `spring.datasource.url` — mặc định `jdbc:mysql://localhost:3306/StudentManagementDB?...`
- `spring.datasource.username` — mặc định `root`
- `spring.datasource.password` — mặc định `123456`

### 4. Chạy backend

Yêu cầu: Java 17+, Maven 3.8+.

```cmd
cd backend
mvn spring-boot:run
```

### 5. Mở website

Sau khi backend chạy, mở trình duyệt:

```text
http://localhost:8080
```

Hệ thống sẽ tự chuyển sang trang `login` nếu chưa đăng nhập.

## Tài khoản demo

- `admin / admin123`
- `teacher / teacher123`
- `student / student123`

## API chính

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `PATCH /api/auth/change-password` (cần đăng nhập, xác nhận mật khẩu cũ)
- `GET /api/students`
- `GET /api/students/page?...&sortBy=fieldName&sortDir=asc|desc` — `sortBy` chấp nhận: `id`, `studentCode`, `fullName`, `className`, `major`, `faculty`, `gpa`, `dateOfBirth`. Giá trị khác sẽ áp dụng mặc định (`id`, `desc`).
- `GET /api/students/filters` (lấy giá trị distinct cho dropdown lọc)
- `GET /api/students/export?keyword=...&faculty=...&major=...&className=...` (xuất CSV)
- `GET /api/students/me`
- `GET /api/students/dashboard`
- `POST /api/students`
- `PUT /api/students/{id}`
- `DELETE /api/students/{id}`
- `DELETE /api/students/bulk` (ADMIN - xóa nhiều, body: `[id1, id2, ...]`)
- `GET /api/logs`
