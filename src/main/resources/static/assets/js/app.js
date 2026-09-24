const API_BASE = "/api/students";
const AUTH_BASE = "/api/auth";
const LOG_BASE = "/api/logs";

const ROLE_LABELS = {
    ADMIN: "Admin",
    TEACHER: "Giảng viên",
    STUDENT: "Sinh viên"
};

const ACTION_LABELS = {
    LOGIN: "Đăng nhập",
    LOGOUT: "Đăng xuất",
    CREATE: "Thêm mới",
    UPDATE: "Cập nhật",
    DELETE: "Xóa"
};

const TARGET_LABELS = {
    AUTH: "Phiên đăng nhập",
    STUDENT: "Sinh viên"
};

function normalizeStatus(status) {
    return stripDiacritics(status).toLowerCase().replace(/\s+/g, "-");
}

const STATUS_CANONICAL = {
    "dang-hoc":   { label: "Đang học",   color: "#10b981", order: 0 },
    "canh-bao":   { label: "Cảnh báo",   color: "#f59e0b", order: 1 },
    "bao-luu":    { label: "Bảo lưu",    color: "#f59e0b", order: 2 },
    "tot-nghiep": { label: "Tốt nghiệp", color: "#2563eb", order: 3 },
    "thoi-hoc":   { label: "Thôi học",  color: "#ef4444", order: 4 }
};

const ROLE_SECTIONS = {
    ADMIN: ["dashboard", "students", "stats", "logs"],
    TEACHER: ["dashboard", "students", "stats"],
    STUDENT: ["profile"]
};

const state = {
    currentUser: null,
    students: [],
    currentPage: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    currentKeyword: "",
    currentFaculty: "",
    currentMajor: "",
    currentClassName: "",
    filterOptions: { faculties: [], majors: [], classes: [] },
    logs: [],
    logPage: 0,
    logPageSize: 10,
    logTotalPages: 0,
    deleteId: null,
    confirmCallback: null,
    searchDebounceTimer: null,
    selectedStudentIds: new Set(),
    sortBy: "id",
    sortDir: "desc",
    activeSection: "dashboard",
    detailStudent: null
};

const elements = {
    pageEyebrow: document.getElementById("pageEyebrow"),
    pageTitle: document.getElementById("pageTitle"),
    pageSubtitle: document.getElementById("pageSubtitle"),
    currentUserName: document.getElementById("currentUserName"),
    currentUserRoleBadge: document.getElementById("currentUserRoleBadge"),
    dropdownUserName: document.getElementById("dropdownUserName"),
    dropdownUserRole: document.getElementById("dropdownUserRole"),
    userProfileToggle: document.getElementById("userProfileToggle"),
    userDropdown: document.getElementById("userDropdown"),
    logoutBtn: document.getElementById("logoutBtn"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    themeIcon: document.getElementById("themeIcon"),
    themeIconDropdown: document.getElementById("themeIconDropdown"),
    changePasswordBtn: document.getElementById("changePasswordBtn"),
    passwordModal: document.getElementById("passwordModal"),
    passwordForm: document.getElementById("passwordForm"),
    currentPassword: document.getElementById("currentPassword"),
    newPassword: document.getElementById("newPassword"),
    confirmPassword: document.getElementById("confirmPassword"),
    closePasswordModalBtn: document.getElementById("closePasswordModalBtn"),
    cancelPasswordBtn: document.getElementById("cancelPasswordBtn"),
    passwordError: document.getElementById("passwordError"),
    keywordInput: document.getElementById("keywordInput"),
    searchBtn: document.getElementById("searchBtn"),
    facultyFilter: document.getElementById("facultyFilter"),
    majorFilter: document.getElementById("majorFilter"),
    classNameFilter: document.getElementById("classNameFilter"),
    facultyFilterMobile: document.getElementById("facultyFilterMobile"),
    majorFilterMobile: document.getElementById("majorFilterMobile"),
    classNameFilterMobile: document.getElementById("classNameFilterMobile"),
    filterToggleBtn: document.getElementById("filterToggleBtn"),
    advancedFilterDropdown: document.getElementById("advancedFilterDropdown"),
    applyFilterBtn: document.getElementById("applyFilterBtn"),
    clearFiltersBtn: document.getElementById("clearFiltersBtn"),
    clearFiltersBtnMobile: document.getElementById("clearFiltersBtnMobile"),
    exportCsvBtn: document.getElementById("exportCsvBtn"),
    selectAllCheckbox: document.getElementById("selectAllCheckbox"),
    bulkActionsBar: document.getElementById("bulkActionsBar"),
    bulkDeleteBtn: document.getElementById("bulkDeleteBtn"),
    bulkCount: document.getElementById("bulkCount"),
    clearSelectionBtn: document.getElementById("clearSelectionBtn"),
    openCreateBtn: document.getElementById("openCreateBtn"),
    metricsSection: document.getElementById("metricsSection"),
    studentTableHead: document.getElementById("studentTableHead"),
    studentTableBody: document.getElementById("studentTableBody"),
    emptyState: document.getElementById("emptyState"),
    resultCount: document.getElementById("resultCount"),
    totalStudents: document.getElementById("totalStudents"),
    academicBarChart: document.getElementById("academicBarChart"),
    highestGpaStudent: document.getElementById("highestGpaStudent"),
    highestGpaStudentSub: document.getElementById("highestGpaStudentSub"),
    highestGpaValue: document.getElementById("highestGpaValue"),
    lowestGpaStudent: document.getElementById("lowestGpaStudent"),
    lowestGpaStudentSub: document.getElementById("lowestGpaStudentSub"),
    lowestGpaValue: document.getElementById("lowestGpaValue"),
    facultyChart: document.getElementById("facultyChart"),
    statusChart: document.getElementById("statusChart"),
    statusLegend: document.getElementById("statusLegend"),
    profileGrid: document.getElementById("profileGrid"),
    logCount: document.getElementById("logCount"),
    logTableBody: document.getElementById("logTableBody"),
     logEmptyState: document.getElementById("logEmptyState"),
    logPaginationBar: document.getElementById("logPaginationBar"),
    logPaginationInfo: document.getElementById("logPaginationInfo"),
    logPaginationNav: document.getElementById("logPaginationNav"),
    studentModal: document.getElementById("studentModal"),
    detailModal: document.getElementById("detailModal"),
    detailTitle: document.getElementById("detailTitle"),
    detailAvatar: document.getElementById("detailAvatar"),
    detailStudentCode: document.getElementById("detailStudentCode"),
    detailFullName: document.getElementById("detailFullName"),
    detailDateOfBirth: document.getElementById("detailDateOfBirth"),
    detailClassName: document.getElementById("detailClassName"),
    detailMajor: document.getElementById("detailMajor"),
    detailFaculty: document.getElementById("detailFaculty"),
    detailGpaBadge: document.getElementById("detailGpaBadge"),
    detailStatusBadge: document.getElementById("detailStatusBadge"),
    closeDetailBtn: document.getElementById("closeDetailBtn"),
    cancelDetailBtn: document.getElementById("cancelDetailBtn"),
    editFromDetailBtn: document.getElementById("editFromDetailBtn"),
    studentModal: document.getElementById("studentModal"),
    modalTitle: document.getElementById("modalTitle"),
    studentForm: document.getElementById("studentForm"),
    studentId: document.getElementById("studentId"),
    studentCode: document.getElementById("studentCode"),
    fullName: document.getElementById("fullName"),
    dateOfBirth: document.getElementById("dateOfBirth"),
    className: document.getElementById("className"),
    major: document.getElementById("major"),
    faculty: document.getElementById("faculty"),
    gpa: document.getElementById("gpa"),
    status: document.getElementById("status"),
    closeModalBtn: document.getElementById("closeModalBtn"),
    cancelBtn: document.getElementById("cancelBtn"),
    cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
    confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
    confirmModal: document.getElementById("confirmModal"),
    confirmModalTitle: document.getElementById("confirmModalTitle"),
    confirmModalDesc: document.getElementById("confirmModalDesc"),
    toast: document.getElementById("toast"),
    menuItems: Array.from(document.querySelectorAll(".menu-item[data-section]")),
    dashboardSection: document.getElementById("dashboardSection"),
    studentsSection: document.getElementById("studentsSection"),
    statsSection: document.getElementById("statsSection"),
    profileSection: document.getElementById("profileSection"),
    logsSection: document.getElementById("logsSection"),
    paginationBar: document.getElementById("paginationBar"),
    paginationInfo: document.getElementById("paginationInfo"),
    paginationNav: document.getElementById("paginationNav")
};

const sections = {
    dashboard: elements.dashboardSection,
    students: elements.studentsSection,
    stats: elements.statsSection,
    profile: elements.profileSection,
    logs: elements.logsSection
};

async function request(url, options = {}) {
    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    };

    const response = await fetch(url, config);
    let payload = null;

    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    if (response.status === 401) {
        window.location.replace("/login");
        throw new Error(payload && payload.message ? payload.message : "Phiên đăng nhập đã hết hạn");
    }

    if (!response.ok || !payload || !payload.success) {
        throw new Error(payload && payload.message ? payload.message : "Không thể xử lý yêu cầu");
    }

    return payload.data;
}

function showToast(message, isError = false) {
    elements.toast.textContent = message;
    elements.toast.style.background = isError ? "var(--red)" : "var(--navy)";
    elements.toast.classList.remove("hidden");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
        elements.toast.classList.add("hidden");
    }, 2600);
}

function stripDiacritics(text) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}

function normalizeStatus(status) {
    return stripDiacritics(status).toLowerCase().replace(/\s+/g, "-");
}

function formatGpa(gpa) {
    return Number(gpa).toFixed(2);
}

function formatDate(value) {
    if (!value) {
        return "--";
    }
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
    return new Intl.DateTimeFormat("vi-VN").format(new Date(normalized));
}

function formatDateTime(value) {
    if (!value) {
        return "--";
    }
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(new Date(value));
}

function formatRole(role) {
    return ROLE_LABELS[role] || role;
}

function formatAction(action) {
    return ACTION_LABELS[action] || action;
}

function formatTarget(targetType, targetId) {
    const label = TARGET_LABELS[targetType] || targetType;
    return targetId ? `${label} #${targetId}` : label;
}

function getDefaultSection() {
    const visibleSectionKeys = ROLE_SECTIONS[state.currentUser.role] || [];
    return visibleSectionKeys[0] || "dashboard";
}

function setSessionLabels() {
    const roleLabel = formatRole(state.currentUser.role);
    const meta = `${roleLabel} · ${state.currentUser.username}`;

    elements.currentUserName.textContent = state.currentUser.fullName;
    elements.currentUserRoleBadge.textContent = roleLabel;
    elements.currentUserRoleBadge.className = "pill " + state.currentUser.role.toLowerCase();
    elements.dropdownUserName.textContent = state.currentUser.fullName;
    elements.dropdownUserRole.textContent = meta;

    if (state.currentUser.role === "STUDENT") {
        elements.pageEyebrow.textContent = "Cổng thông tin sinh viên";
        elements.pageTitle.textContent = "Thông tin cá nhân";
        elements.pageSubtitle.textContent = "Bạn đang đăng nhập với quyền xem hồ sơ của chính mình.";
        return;
    }

    elements.pageEyebrow.textContent = "Hệ thống quản lý sinh viên";
    elements.pageTitle.textContent = "Student Dashboard";
    elements.pageSubtitle.textContent = state.currentUser.role === "ADMIN"
        ? "Quản trị viên có toàn quyền với dữ liệu sinh viên và nhật ký hoạt động."
        : "Giảng viên chỉ có quyền xem dữ liệu và thống kê.";
}

function applyRoleUI() {
    const role = state.currentUser.role;
    const allowedSections = new Set(ROLE_SECTIONS[role] || []);

    elements.menuItems.forEach(button => {
        const allowedRoles = button.dataset.roles.split(",");
        button.classList.toggle("hidden", !allowedRoles.includes(role));
    });

    Object.entries(sections).forEach(([key, section]) => {
        section.classList.toggle("hidden", !allowedSections.has(key));
    });

    elements.metricsSection.classList.toggle("hidden", role === "STUDENT");
    elements.openCreateBtn.classList.toggle("hidden", role !== "ADMIN");
    elements.exportCsvBtn.classList.toggle("hidden", role === "STUDENT");
    elements.bulkActionsBar.classList.toggle("hidden", role !== "ADMIN");
    setSessionLabels();
    setActiveMenu(getDefaultSection());
}

function renderSortHeader(label, field) {
    const isSorted = state.sortBy === field;
    const icon = !isSorted ? '<span class="sort-indicator" style="opacity:0.3">↕</span>' : (state.sortDir === "asc" ? '<span class="sort-indicator">▲</span>' : '<span class="sort-indicator">▼</span>');
    return `<th data-sort="${field}" class="sortable ${isSorted ? "sorted-" + state.sortDir : ""}">${label} ${icon}</th>`;
}

function renderStudents(students) {
    const isAdmin = state.currentUser.role === "ADMIN";

    elements.studentTableHead.innerHTML = `
        <tr>
            ${isAdmin ? '<th><input type="checkbox" id="selectAllCheckbox" class="row-checkbox"></th>' : ""}
            ${renderSortHeader("Mã SV", "studentCode")}
            ${renderSortHeader("Họ tên", "fullName")}
            ${renderSortHeader("Lớp", "className")}
            ${renderSortHeader("Khoa", "faculty")}
            ${renderSortHeader("Chuyên ngành", "major")}
            ${renderSortHeader("GPA", "gpa")}
            <th>Trạng thái</th>
            ${isAdmin ? "<th>Thao tác</th>" : ""}
        </tr>
    `;
    elements.selectAllCheckbox = document.getElementById("selectAllCheckbox");

    elements.resultCount.textContent = `${students.length} kết quả (trang ${state.currentPage + 1}/${state.totalPages})`;
    elements.emptyState.classList.toggle("hidden", students.length > 0);
    elements.paginationBar.classList.toggle("hidden", state.totalPages <= 0 || students.length === 0);
    renderPagination();

    elements.studentTableBody.innerHTML = students.map(student => `
        <tr data-student-id="${student.id}">
            ${isAdmin ? `<td><input type="checkbox" class="row-checkbox" data-id="${student.id}" ${state.selectedStudentIds.has(student.id) ? "checked" : ""}></td>` : ""}
            <td>${student.studentCode}</td>
            <td>
                <div class="student-name">${student.fullName}</div>
                <div class="student-meta">${formatDate(student.dateOfBirth)}</div>
            </td>
            <td>${student.className}</td>
            <td>${student.faculty}</td>
            <td>${student.major}</td>
            <td>${formatGpa(student.gpa)}</td>
            <td><span class="status ${normalizeStatus(student.status)}">${student.status}</span></td>
            ${isAdmin ? `
                <td>
                    <div class="row-actions">
                        <button class="action-btn edit" type="button" data-action="edit" data-id="${student.id}">Sửa</button>
                        <button class="action-btn delete" type="button" data-action="delete" data-id="${student.id}">Xóa</button>
                    </div>
                </td>
            ` : ""}
        </tr>
    `).join("");
}

function renderGpaBadge(gpa) {
    const value = Number(gpa).toFixed(2);
    let cls = "gpa-badge--low";
    if (gpa >= 8.0) cls = "gpa-badge--high";
    else if (gpa >= 6.5) cls = "gpa-badge--mid";
    return `<span class="gpa-badge ${cls}">${value}</span>`;
}

function renderStatusBadge(status) {
    return `<span class="status ${normalizeStatus(status)}">${status}</span>`;
}

function renderStudentDetail(student) {
    elements.detailTitle.textContent = student.fullName || "--";
    elements.detailStudentCode.textContent = student.studentCode || "--";
    elements.detailFullName.textContent = student.fullName || "--";
    elements.detailDateOfBirth.textContent = formatDate(student.dateOfBirth);
    elements.detailClassName.textContent = student.className || "--";
    elements.detailMajor.textContent = student.major || "--";
    elements.detailFaculty.textContent = student.faculty || "--";
    elements.detailGpaBadge.innerHTML = renderGpaBadge(student.gpa);
    elements.detailStatusBadge.innerHTML = renderStatusBadge(student.status || "Đang học");

    const initial = (student.fullName || "SV").charAt(0).toUpperCase();
    elements.detailAvatar.innerHTML = `<span class="avatar-text">${initial}</span>`;
}

function openDetailModal(student) {
    state.detailStudent = student;
    renderStudentDetail(student);
    elements.detailModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeDetailModal() {
    state.detailStudent = null;
    elements.detailModal.classList.add("hidden");
    document.body.style.overflow = "";
}

function renderAcademicBarChart(stats) {
    const colors = ["#10b981", "#2563eb", "#f59e0b"];
    const max = Math.max(...stats.map(item => item.count), 1);

    elements.academicBarChart.innerHTML = stats.map((item, index) => `
        <div class="bar-item">
            <div class="bar-head">
                <span style="color:${colors[index]}">${item.label}</span>
                <strong>${item.count}</strong>
            </div>
            <div class="bar-track">
                <div class="bar-value" style="width:${(item.count / max) * 100}%; background:${colors[index]}"></div>
            </div>
        </div>
    `).join("");
}

function renderFacultyChart(stats) {
    const max = Math.max(...stats.map(item => item.count), 1);
    elements.facultyChart.innerHTML = stats.map(item => `
        <div class="bar-item">
            <div class="bar-head">
                <span>${item.faculty}</span>
                <strong>${item.count}</strong>
            </div>
            <div class="bar-track">
                <div class="bar-value" style="width:${(item.count / max) * 100}%"></div>
            </div>
        </div>
    `).join("");
}

function resolveStatusKey(status) {
    const norm = stripDiacritics(status || "").toLowerCase().replace(/\s+/g, "-");
    return STATUS_CANONICAL[norm] || { label: status || "Không xác định", color: "#6c757d", order: 99 };
}

function renderStatusChart(statusStats) {
    const raw = Object.entries(statusStats || {});

    const deduped = new Map();
    for (const [status, count] of raw) {
        const canon = resolveStatusKey(status);
        const key = canon.label;
        deduped.set(key, (deduped.get(key) || 0) + (count || 0));
    }

    const total = [...deduped.values()].reduce((sum, c) => sum + c, 0);

    const sortedKeys = [...deduped.keys()].sort((a, b) => {
        const oa = resolveStatusKey(a).order;
        const ob = resolveStatusKey(b).order;
        return oa - ob;
    });

    let currentAngle = 0;
    const segments = sortedKeys.map(label => {
        const count = deduped.get(label) || 0;
        const color = resolveStatusKey(label).color;
        const angle = total === 0 ? 120 : (count / total) * 360;
        const start = currentAngle;
        const end = currentAngle + angle;
        currentAngle = end;
        return `${color} ${start}deg ${end}deg`;
    });

    elements.statusChart.style.setProperty("--donut", `conic-gradient(${segments.join(", ") || "#edf2fb 0deg 360deg"})`);
    elements.statusLegend.innerHTML = sortedKeys.map(label => {
        const count = deduped.get(label) || 0;
        const color = resolveStatusKey(label).color;
        return `
        <div class="legend-item">
            <div class="legend-row">
                <span><span class="dot" style="background:${color}"></span>${label}</span>
                <strong>${count}</strong>
            </div>
            <div class="bar-track">
                <div class="bar-value" style="width:${total === 0 ? 0 : (count / total) * 100}%; background:${color}"></div>
            </div>
        </div>
    `;
    }).join("");
}

function renderDashboard(stats) {
    elements.totalStudents.textContent = stats.totalStudents;

    if (stats.highestGpaStudent) {
        elements.highestGpaStudent.textContent = stats.highestGpaStudent.fullName || "--";
        elements.highestGpaStudentSub.textContent = "Mã: " + (stats.highestGpaStudent.studentCode || "--");
        elements.highestGpaValue.textContent = "GPA: " + formatGpa(stats.highestGpaStudent.gpa);
        elements.highestGpaValue.classList.remove("hidden");
    } else {
        elements.highestGpaStudent.textContent = "--";
        elements.highestGpaStudentSub.textContent = "";
        elements.highestGpaValue.classList.add("hidden");
    }

    if (stats.lowestGpaStudent) {
        elements.lowestGpaStudent.textContent = stats.lowestGpaStudent.fullName || "--";
        elements.lowestGpaStudentSub.textContent = "Mã: " + (stats.lowestGpaStudent.studentCode || "--");
        elements.lowestGpaValue.textContent = "GPA: " + formatGpa(stats.lowestGpaStudent.gpa);
        elements.lowestGpaValue.classList.remove("hidden");
    } else {
        elements.lowestGpaStudent.textContent = "--";
        elements.lowestGpaStudentSub.textContent = "";
        elements.lowestGpaValue.classList.add("hidden");
    }

    renderAcademicBarChart(stats.academicStats);
    renderStatusChart(stats.statusStats);
    renderFacultyChart(stats.facultyStats);
}

function renderProfile(student) {
    const fields = [
        ["Mã sinh viên", student.studentCode],
        ["Họ tên", student.fullName],
        ["Ngày sinh", formatDate(student.dateOfBirth)],
        ["Lớp", student.className],
        ["Chuyên ngành", student.major],
        ["Khoa", student.faculty],
        ["GPA", formatGpa(student.gpa)],
        ["Trạng thái", student.status]
    ];

    elements.profileGrid.innerHTML = fields.map(([label, value]) => `
        <article class="profile-item">
            <span class="profile-label">${label}</span>
            <strong>${value}</strong>
        </article>
    `).join("");
}

function renderLogs(logs) {
    state.logTotalPages = Math.ceil(logs.length / state.logPageSize);
    if (state.logTotalPages < 1) state.logTotalPages = 1;

    const start = state.logPage * state.logPageSize;
    const end = Math.min(start + state.logPageSize, logs.length);
    const pageLogs = logs.slice(start, end);

    elements.logCount.textContent = `${logs.length} bản ghi`;
    elements.logEmptyState.classList.toggle("hidden", logs.length > 0);
    elements.logPaginationBar.classList.toggle("hidden", logs.length <= 0 || state.logTotalPages <= 1);

    elements.logTableBody.innerHTML = pageLogs.map(log => `
        <tr>
            <td>${formatDateTime(log.createdAt)}</td>
            <td>${log.username}</td>
            <td>${formatRole(log.userRole)}</td>
            <td>${formatAction(log.action)}</td>
            <td>${formatTarget(log.targetType, log.targetId)}</td>
            <td>${log.description}</td>
        </tr>
    `).join("");

    renderLogPagination();
}

function renderLogPagination() {
    const total = state.logTotalPages;
    const allLogs = state.logs.length;

    if (total <= 0) {
        elements.logPaginationNav.innerHTML = "";
        return;
    }

    const infoStart = allLogs === 0 ? 0 : state.logPage * state.logPageSize + 1;
    const infoEnd = Math.min((state.logPage + 1) * state.logPageSize, allLogs);
    elements.logPaginationInfo.textContent = `${infoStart}-${infoEnd} / ${allLogs} bản ghi`;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, state.logPage - Math.floor(maxVisible / 2));
    let end = Math.min(total - 1, start + maxVisible - 1);
    start = Math.max(0, end - maxVisible + 1);

    pages.push({ label: "Trước", page: state.logPage - 1, disabled: state.logPage === 0 });
    for (let i = start; i <= end; i++) {
        pages.push({ label: String(i + 1), page: i, active: i === state.logPage });
    }
    pages.push({ label: "Sau", page: state.logPage + 1, disabled: state.logPage >= total - 1 });

    elements.logPaginationNav.innerHTML = pages.map(p => `
        <button class="pagination-btn ${p.disabled ? "disabled" : ""} ${p.active ? "active" : ""}"
                type="button" data-action="log-page" data-page="${p.page}" ${p.disabled ? "disabled" : ""}>${p.label}</button>
    `).join("");
}

function goToLogPage(page) {
    if (page < 0 || page >= state.logTotalPages) return;
    state.logPage = page;
    renderLogs(state.logs);
}

async function loadCurrentUser() {
    state.currentUser = await request(`${AUTH_BASE}/me`);
}

async function loadStudents(keyword = elements.keywordInput.value.trim()) {
    const normalizedKeyword = typeof keyword === "string" ? keyword.trim() : "";
    state.currentKeyword = normalizedKeyword;
    state.currentPage = 0;

    const params = new URLSearchParams({
        page: 0,
        size: state.pageSize,
        sortBy: state.sortBy,
        sortDir: state.sortDir
    });
    if (normalizedKeyword) params.set("keyword", normalizedKeyword);
    if (state.currentFaculty) params.set("faculty", state.currentFaculty);
    if (state.currentMajor) params.set("major", state.currentMajor);
    if (state.currentClassName) params.set("className", state.currentClassName);

    const pageData = await request(`${API_BASE}/page?${params.toString()}`);
    state.students = pageData.content;
    state.totalElements = pageData.totalElements;
    state.totalPages = pageData.totalPages;
    state.currentPage = pageData.pageNumber;
    clearSelection();
    renderStudents(state.students);
}

function renderPagination() {
    const total = state.totalPages;
    if (total <= 0) {
        elements.paginationNav.innerHTML = "";
        return;
    }

    const infoStart = state.totalElements === 0 ? 0 : state.currentPage * state.pageSize + 1;
    const infoEnd = Math.min((state.currentPage + 1) * state.pageSize, state.totalElements);
    elements.paginationInfo.textContent = `${infoStart}-${infoEnd} / ${state.totalElements} sinh viên`;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, state.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(total - 1, start + maxVisible - 1);
    start = Math.max(0, end - maxVisible + 1);

    pages.push({ label: "Trước", page: state.currentPage - 1, disabled: state.currentPage === 0 });
    for (let i = start; i <= end; i++) {
        pages.push({ label: String(i + 1), page: i, active: i === state.currentPage });
    }
    pages.push({ label: "Sau", page: state.currentPage + 1, disabled: state.currentPage >= total - 1 });

        elements.paginationNav.innerHTML = pages.map(p => `
        <button class="pagination-btn ${p.disabled ? "disabled" : ""} ${p.active ? "active" : ""}"
                type="button" data-action="page" data-page="${p.page}" ${p.disabled ? "disabled" : ""}>${p.label}</button>
    `).join("");
}

async function goToPage(page) {
    if (page < 0 || page >= state.totalPages) return;
    state.currentPage = page;
    const params = new URLSearchParams({
        page: page,
        size: state.pageSize,
        sortBy: state.sortBy,
        sortDir: state.sortDir
    });
    params.set("keyword", state.currentKeyword);
    if (state.currentFaculty) params.set("faculty", state.currentFaculty);
    if (state.currentMajor) params.set("major", state.currentMajor);
    if (state.currentClassName) params.set("className", state.currentClassName);
    const pageData = await request(`${API_BASE}/page?${params.toString()}`);
    state.students = pageData.content;
    state.totalElements = pageData.totalElements;
    state.totalPages = pageData.totalPages;
    state.currentPage = pageData.pageNumber;
    clearSelection();
    renderStudents(state.students);
}

async function refreshCurrentPage() {
    const params = new URLSearchParams({
        page: state.currentPage,
        size: state.pageSize,
        sortBy: state.sortBy,
        sortDir: state.sortDir
    });
    if (state.currentKeyword) params.set("keyword", state.currentKeyword);
    if (state.currentFaculty) params.set("faculty", state.currentFaculty);
    if (state.currentMajor) params.set("major", state.currentMajor);
    if (state.currentClassName) params.set("className", state.currentClassName);
    const pageData = await request(`${API_BASE}/page?${params.toString()}`);
    state.students = pageData.content;
    state.totalElements = pageData.totalElements;
    state.totalPages = pageData.totalPages;
    state.currentPage = pageData.pageNumber;
    clearSelection();
    renderStudents(state.students);
}

async function loadFilterOptions() {
    state.filterOptions = await request(`${API_BASE}/filters`);
    renderFilterOptions();
}

async function exportToCsv() {
    const params = new URLSearchParams();
    if (state.currentKeyword) params.set("keyword", state.currentKeyword);
    if (state.currentFaculty) params.set("faculty", state.currentFaculty);
    if (state.currentMajor) params.set("major", state.currentMajor);
    if (state.currentClassName) params.set("className", state.currentClassName);

    const url = `${API_BASE}/export?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(payload && payload.message ? payload.message : "Không thể xuất file CSV");
        }

        const blob = await response.blob();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const filename = `students_export_${dateStr}.csv`;
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        showToast("Xuất file CSV thành công");
    } catch (error) {
        showToast(error.message, true);
    }
}

function renderFilterOptions() {
    const { faculties, majors, classes } = state.filterOptions;

    elements.facultyFilter.innerHTML = '<option value="">Tất cả khoa</option>' +
        faculties.map(f => `<option value="${f}">${f}</option>`).join("");

    elements.majorFilter.innerHTML = '<option value="">Tất cả chuyên ngành</option>' +
        majors.map(m => `<option value="${m}">${m}</option>`).join("");

    elements.classNameFilter.innerHTML = '<option value="">Tất cả lớp</option>' +
        classes.map(c => `<option value="${c}">${c}</option>`).join("");

    elements.facultyFilterMobile.innerHTML = '<option value="">Tất cả khoa</option>' +
        faculties.map(f => `<option value="${f}">${f}</option>`).join("");
    elements.majorFilterMobile.innerHTML = '<option value="">Tất cả chuyên ngành</option>' +
        majors.map(m => `<option value="${m}">${m}</option>`).join("");
    elements.classNameFilterMobile.innerHTML = '<option value="">Tất cả lớp</option>' +
        classes.map(c => `<option value="${c}">${c}</option>`).join("");
}

function applyFilters() {
    state.currentPage = 0;
    loadStudents();
}

function clearSelection() {
    state.selectedStudentIds.clear();
    if (elements.selectAllCheckbox) {
        elements.selectAllCheckbox.checked = false;
    }
    updateBulkActionsBar();
}

function updateBulkActionsBar() {
    const count = state.selectedStudentIds.size;
    elements.bulkCount.textContent = count + " đã chọn";
    elements.bulkActionsBar.classList.toggle("hidden", count === 0);
}

function syncSelectAllCheckbox() {
    if (!elements.selectAllCheckbox) return;
    const rowCheckboxes = elements.studentTableBody.querySelectorAll('.row-checkbox[data-id]');
    const allChecked = rowCheckboxes.length > 0 && Array.from(rowCheckboxes).every(cb => cb.checked);
    elements.selectAllCheckbox.checked = allChecked;
    elements.selectAllCheckbox.indeterminate = rowCheckboxes.length > 0 && !allChecked && Array.from(rowCheckboxes).some(cb => cb.checked);
}

async function loadDashboard() {
    const stats = await request(`${API_BASE}/dashboard`);
    renderDashboard(stats);
}

async function loadProfile() {
    const student = await request(`${API_BASE}/me`);
    renderProfile(student);
}

async function loadLogs() {
    state.logs = await request(LOG_BASE);
    state.logPage = 0;
    renderLogs(state.logs);
}

async function loadStaffData(keyword = "") {
    const tasks = [
        loadStudents(keyword),
        loadDashboard(),
        loadFilterOptions()
    ];

    if (state.currentUser.role === "ADMIN") {
        tasks.push(loadLogs());
    }

    const results = await Promise.allSettled(tasks);
    const failed = results.find(result => result.status === "rejected");
    if (failed) {
        throw failed.reason;
    }
}

function getFormPayload() {
    return {
        studentCode: elements.studentCode.value.trim().toUpperCase(),
        fullName: elements.fullName.value.trim(),
        dateOfBirth: elements.dateOfBirth.value,
        className: elements.className.value.trim(),
        major: elements.major.value.trim(),
        faculty: elements.faculty.value.trim(),
        gpa: Number(elements.gpa.value),
        status: elements.status.value
    };
}

function openModal(title, student = null) {
    elements.modalTitle.textContent = title;
    elements.studentForm.reset();
    elements.studentId.value = student ? student.id : "";
    elements.studentCode.value = student ? student.studentCode : "";
    elements.fullName.value = student ? student.fullName : "";
    elements.dateOfBirth.value = student ? student.dateOfBirth : "";
    elements.className.value = student ? student.className : "";
    elements.major.value = student ? student.major : "";
    elements.faculty.value = student ? student.faculty : "";
    elements.gpa.value = student ? student.gpa : "";
    elements.status.value = student ? student.status : "Đang học";
    elements.studentModal.classList.remove("hidden");
}

function closeModal() {
    elements.studentModal.classList.add("hidden");
}

function openDeleteModal(id) {
    state.deleteId = id;
    closeUserDropdown();
    openConfirmModal(
        "Xóa sinh viên này?",
        "Dữ liệu sẽ bị xóa khỏi hệ thống. Bạn có thể tiếp tục nếu chắc chắn.",
        "Xóa",
        async () => {
            if (!state.deleteId) return;
            await request(`${API_BASE}/${state.deleteId}`, { method: "DELETE" });
            closeConfirmModal();
            await refreshAdminData();
            showToast("Xóa sinh viên thành công");
        }
    );
}

function openLogoutConfirm() {
    closeUserDropdown();
    openConfirmModal(
        "Đăng xuất?",
        "Bạn có chắc muốn đăng xuất? Mọi thay đổi chưa lưu sẽ bị mất.",
        "Đăng xuất",
        async () => {
            closeConfirmModal();
            try {
                await request(`${AUTH_BASE}/logout`, { method: "POST" });
            } catch (error) {
                // ignore network errors, still redirect
            } finally {
                window.location.replace("/login");
            }
        }
    );
}

function openConfirmModal(title, desc, confirmText, callback) {
    elements.confirmModalTitle.textContent = title;
    elements.confirmModalDesc.textContent = desc;
    elements.confirmDeleteBtn.textContent = confirmText;
    state.confirmCallback = callback;
    elements.confirmModal.classList.remove("hidden");
}

function closeConfirmModal() {
    state.deleteId = null;
    state.confirmCallback = null;
    elements.confirmModal.classList.add("hidden");
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    elements.themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
    const newTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
}

function openPasswordModal() {
    elements.passwordForm.reset();
    elements.passwordError.textContent = "";
    elements.passwordError.classList.add("hidden");
    elements.passwordModal.classList.remove("hidden");
}

function closePasswordModal() {
    elements.passwordModal.classList.add("hidden");
}

function closeUserDropdown() {
    if (elements.userDropdown) {
        elements.userDropdown.classList.add("hidden");
    }
}

async function handlePasswordChange(event) {
    event.preventDefault();

    const currentPassword = elements.currentPassword.value.trim();
    const newPassword = elements.newPassword.value;
    const confirmPassword = elements.confirmPassword.value;

    elements.passwordError.textContent = "";
    elements.passwordError.classList.add("hidden");

    if (!currentPassword || !newPassword || !confirmPassword) {
        elements.passwordError.textContent = "Vui lòng nhập đầy đủ thông tin";
        elements.passwordError.classList.remove("hidden");
        return;
    }

    if (newPassword !== confirmPassword) {
        elements.passwordError.textContent = "Mật khẩu mới và xác nhận không khớp";
        elements.passwordError.classList.remove("hidden");
        return;
    }

    if (newPassword.length < 6) {
        elements.passwordError.textContent = "Mật khẩu mới phải có ít nhất 6 ký tự";
        elements.passwordError.classList.remove("hidden");
        return;
    }

    try {
        await request(`${AUTH_BASE}/change-password`, {
            method: "PATCH",
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            })
        });

        closePasswordModal();
        showToast("Đổi mật khẩu thành công");
    } catch (error) {
        elements.passwordError.textContent = error.message;
        elements.passwordError.classList.remove("hidden");
    }
}

function setActiveMenu(sectionKey) {
    state.activeSection = sectionKey;
    elements.menuItems.forEach(button => {
        button.classList.toggle("active", !button.classList.contains("hidden") && button.dataset.section === sectionKey);
    });
}

function pulseSection(section) {
    if (!section || section.classList.contains("hidden")) {
        return;
    }

    section.classList.remove("section-focus");
    window.requestAnimationFrame(() => {
        section.classList.add("section-focus");
        window.clearTimeout(section.focusTimer);
        section.focusTimer = window.setTimeout(() => {
            section.classList.remove("section-focus");
        }, 1200);
    });
}

function navigateToSection(sectionKey, options = {}) {
    const section = sections[sectionKey];
    const instant = Boolean(options.instant);

    if (!section) {
        return;
    }

    const allowedSections = ROLE_SECTIONS[state.currentUser ? state.currentUser.role : "STUDENT"] || [];
    if (!allowedSections.includes(sectionKey)) {
        return;
    }

    setActiveMenu(sectionKey);

    Object.keys(sections).forEach(key => {
        sections[key].classList.toggle("hidden", key !== sectionKey);
    });

    const showMetrics = sectionKey === "dashboard" &&
        state.currentUser && state.currentUser.role !== "STUDENT";
    elements.metricsSection.classList.toggle("hidden", !showMetrics);

    const targetTop = Math.max(window.scrollY + section.getBoundingClientRect().top - 28, 0);
    window.scrollTo({ top: targetTop, behavior: instant ? "auto" : "smooth" });
    pulseSection(section);
}

function getCurrentSectionFromScroll() {
    const visibleSections = Object.entries(sections).filter(([, section]) => !section.classList.contains("hidden"));
    if (visibleSections.length === 0) {
        return state.activeSection;
    }

    const anchor = 180;
    let currentSection = visibleSections[0][0];

    visibleSections.forEach(([sectionKey, section]) => {
        if (section.getBoundingClientRect().top <= anchor) {
            currentSection = sectionKey;
        }
    });

    return currentSection;
}

function syncMenuWithScroll() {
    setActiveMenu(getCurrentSectionFromScroll());
}

async function refreshAdminData() {
    const results = await Promise.allSettled([
        loadStudents(state.currentKeyword || elements.keywordInput.value.trim()),
        loadDashboard(),
        loadFilterOptions(),
        loadLogs()
    ]);
    const failed = results.find(result => result.status === "rejected");
    if (failed) {
        throw failed.reason;
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    const id = elements.studentId.value;
    const payload = getFormPayload();
    const method = id ? "PUT" : "POST";
    const url = id ? `${API_BASE}/${id}` : API_BASE;

    await request(url, {
        method,
        body: JSON.stringify(payload)
    });

    closeModal();
    await refreshAdminData();
    showToast(id ? "Cập nhật sinh viên thành công" : "Thêm sinh viên thành công");
}

function onTableClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) {
        return;
    }

    const studentId = Number(button.dataset.id);
    const student = state.students.find(item => item.id === studentId);

    if (button.dataset.action === "edit" && student) {
        openModal("Cập nhật sinh viên", student);
    }

    if (button.dataset.action === "delete") {
        openDeleteModal(studentId);
    }
}

function bindEvents() {
    elements.menuItems.forEach(button => {
        button.addEventListener("click", () => {
            navigateToSection(button.dataset.section);
        });
    });

    elements.studentTableBody.addEventListener("click", event => {
        if (event.target.closest(".row-checkbox")) return;
        if (event.target.closest("button[data-action]")) return;
        const row = event.target.closest("tr[data-student-id]");
        if (!row) return;
        const studentId = Number(row.dataset.studentId);
        const student = state.students.find(item => item.id === studentId);
        if (student) {
            openDetailModal(student);
        }
    });

    elements.closeDetailBtn.addEventListener("click", closeDetailModal);
    elements.cancelDetailBtn.addEventListener("click", closeDetailModal);
    elements.detailModal.addEventListener("click", event => {
        if (event.target === elements.detailModal) closeDetailModal();
    });

    elements.editFromDetailBtn.addEventListener("click", () => {
        if (state.detailStudent) {
            closeDetailModal();
            openModal("Cập nhật sinh viên", state.detailStudent);
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            if (!elements.detailModal.classList.contains("hidden")) {
                closeDetailModal();
            }
            if (elements.userDropdown && !elements.userDropdown.classList.contains("hidden")) {
                closeUserDropdown();
            }
        }
    });

    elements.searchBtn.addEventListener("click", async () => {
        try {
            await loadStudents();
            navigateToSection("students");
        } catch (error) {
            showToast(error.message, true);
        }
    });

    elements.facultyFilter.addEventListener("change", () => {
        state.currentFaculty = elements.facultyFilter.value;
        if (elements.facultyFilterMobile) elements.facultyFilterMobile.value = state.currentFaculty;
        applyFilters();
    });

    elements.majorFilter.addEventListener("change", () => {
        state.currentMajor = elements.majorFilter.value;
        if (elements.majorFilterMobile) elements.majorFilterMobile.value = state.currentMajor;
        applyFilters();
    });

    elements.classNameFilter.addEventListener("change", () => {
        state.currentClassName = elements.classNameFilter.value;
        if (elements.classNameFilterMobile) elements.classNameFilterMobile.value = state.currentClassName;
        applyFilters();
    });

    elements.clearFiltersBtn.addEventListener("click", () => {
        state.currentFaculty = "";
        state.currentMajor = "";
        state.currentClassName = "";
        elements.facultyFilter.value = "";
        elements.majorFilter.value = "";
        elements.classNameFilter.value = "";
        if (elements.facultyFilterMobile) elements.facultyFilterMobile.value = "";
        if (elements.majorFilterMobile) elements.majorFilterMobile.value = "";
        if (elements.classNameFilterMobile) elements.classNameFilterMobile.value = "";
        applyFilters();
    });

    if (elements.filterToggleBtn) {
        elements.filterToggleBtn.addEventListener("click", () => {
            elements.advancedFilterDropdown.classList.toggle("hidden");
            if (elements.facultyFilterMobile) elements.facultyFilterMobile.value = state.currentFaculty;
            if (elements.majorFilterMobile) elements.majorFilterMobile.value = state.currentMajor;
            if (elements.classNameFilterMobile) elements.classNameFilterMobile.value = state.currentClassName;
        });
    }

    if (elements.applyFilterBtn) {
        elements.applyFilterBtn.addEventListener("click", () => {
            state.currentFaculty = elements.facultyFilterMobile ? elements.facultyFilterMobile.value : "";
            state.currentMajor = elements.majorFilterMobile ? elements.majorFilterMobile.value : "";
            state.currentClassName = elements.classNameFilterMobile ? elements.classNameFilterMobile.value : "";
            if (elements.facultyFilter) elements.facultyFilter.value = state.currentFaculty;
            if (elements.majorFilter) elements.majorFilter.value = state.currentMajor;
            if (elements.classNameFilter) elements.classNameFilter.value = state.currentClassName;
            elements.advancedFilterDropdown.classList.add("hidden");
            applyFilters();
        });
    }

    if (elements.clearFiltersBtnMobile) {
        elements.clearFiltersBtnMobile.addEventListener("click", () => {
            state.currentFaculty = "";
            state.currentMajor = "";
            state.currentClassName = "";
            if (elements.facultyFilterMobile) elements.facultyFilterMobile.value = "";
            if (elements.majorFilterMobile) elements.majorFilterMobile.value = "";
            if (elements.classNameFilterMobile) elements.classNameFilterMobile.value = "";
            if (elements.facultyFilter) elements.facultyFilter.value = "";
            if (elements.majorFilter) elements.majorFilter.value = "";
            if (elements.classNameFilter) elements.classNameFilter.value = "";
            applyFilters();
        });
    }

    document.addEventListener("click", event => {
        if (elements.advancedFilterDropdown && !elements.advancedFilterDropdown.classList.contains("hidden")) {
            if (!elements.advancedFilterDropdown.contains(event.target) &&
                event.target !== elements.filterToggleBtn) {
                elements.advancedFilterDropdown.classList.add("hidden");
            }
        }
    });

    elements.keywordInput.addEventListener("keydown", async event => {
        if (event.key !== "Enter") {
            return;
        }

        try {
            await loadStudents();
            navigateToSection("students");
        } catch (error) {
            showToast(error.message, true);
        }
    });

    elements.keywordInput.addEventListener("keyup", () => {
        if (state.searchDebounceTimer) {
            clearTimeout(state.searchDebounceTimer);
        }
        state.searchDebounceTimer = setTimeout(async () => {
            try {
                await loadStudents();
                navigateToSection("students");
            } catch (error) {
                showToast(error.message, true);
            }
        }, 300);
    });

elements.openCreateBtn.addEventListener("click", () => openModal("Thêm sinh viên"));

elements.exportCsvBtn.addEventListener("click", async () => {
    try {
        await exportToCsv();
    } catch (error) {
        showToast(error.message, true);
    }
});

elements.bulkDeleteBtn.addEventListener("click", () => {
    if (state.selectedStudentIds.size === 0) return;
    openConfirmModal(
        "Xóa " + state.selectedStudentIds.size + " sinh viên?",
        "Dữ liệu sẽ bị xóa khỏi hệ thống. Bạn có chắc chắn?",
        "Xóa",
        async () => {
            const count = state.selectedStudentIds.size;
            await request(`${API_BASE}/bulk`, {
                method: "DELETE",
                body: JSON.stringify(Array.from(state.selectedStudentIds))
            });
            clearSelection();
            closeConfirmModal();
            await refreshCurrentPage();
            showToast("Xóa " + count + " sinh viên thành công");
        }
    );
});

elements.clearSelectionBtn.addEventListener("click", () => {
    clearSelection();
});

    elements.logoutBtn.addEventListener("click", openLogoutConfirm);

    elements.changePasswordBtn.addEventListener("click", () => {
        closeUserDropdown();
        openPasswordModal();
    });
    elements.themeToggleBtn.addEventListener("click", toggleTheme);

    elements.userProfileToggle.addEventListener("click", () => {
        elements.userDropdown.classList.toggle("hidden");
    });

    elements.closePasswordModalBtn.addEventListener("click", closePasswordModal);
    elements.cancelPasswordBtn.addEventListener("click", closePasswordModal);
    elements.passwordForm.addEventListener("submit", handlePasswordChange);

    elements.passwordModal.addEventListener("click", event => {
        if (event.target === elements.passwordModal) {
            closePasswordModal();
        }
    });

    document.addEventListener("click", event => {
        if (elements.userDropdown && !elements.userDropdown.classList.contains("hidden")) {
            if (!elements.userDropdown.contains(event.target) && !elements.userProfileToggle.contains(event.target)) {
                closeUserDropdown();
            }
        }
    });

    elements.closeModalBtn.addEventListener("click", closeModal);
    elements.cancelBtn.addEventListener("click", closeModal);
    elements.cancelDeleteBtn.addEventListener("click", closeConfirmModal);
    elements.confirmDeleteBtn.addEventListener("click", async () => {
        if (!state.confirmCallback) return;
        try {
            await state.confirmCallback();
        } catch (error) {
            showToast(error.message, true);
        }
    });

    elements.studentForm.addEventListener("submit", async event => {
        try {
            await handleSubmit(event);
        } catch (error) {
            showToast(error.message, true);
        }
    });

    elements.studentTableBody.addEventListener("click", onTableClick);

    elements.studentTableBody.addEventListener("change", event => {
        const checkbox = event.target.closest(".row-checkbox[data-id]");
        if (!checkbox) return;

        const id = Number(checkbox.dataset.id);
        if (checkbox.checked) {
            state.selectedStudentIds.add(id);
        } else {
            state.selectedStudentIds.delete(id);
        }
        updateBulkActionsBar();
        syncSelectAllCheckbox();
    });

    elements.studentTableHead.addEventListener("change", event => {
        const checkbox = event.target.closest("#selectAllCheckbox");
        if (!checkbox) return;

        const rowCheckboxes = elements.studentTableBody.querySelectorAll(".row-checkbox[data-id]");
        const isChecked = checkbox.checked;
        rowCheckboxes.forEach(cb => {
            cb.checked = isChecked;
            const id = Number(cb.dataset.id);
            if (isChecked) {
                state.selectedStudentIds.add(id);
            } else {
                state.selectedStudentIds.delete(id);
            }
        });
        updateBulkActionsBar();
    });

    elements.studentTableHead.addEventListener("click", event => {
        const th = event.target.closest("th[data-sort]");
        if (!th) return;

        const field = th.dataset.sort;
        if (state.sortBy === field) {
            state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
            state.sortBy = field;
            state.sortDir = "desc";
        }

        state.currentPage = 0;
        try {
            loadStudents();
        } catch (error) {
            showToast(error.message, true);
        }
    });

    elements.logPaginationNav?.addEventListener("click", event => {
        const button = event.target.closest("button[data-action='log-page']");
        if (!button) return;
        const page = Number(button.dataset.page);
        if (!button.classList.contains("disabled")) {
            goToLogPage(page);
        }
    });

    elements.paginationNav?.addEventListener("click", event => {
        const button = event.target.closest("button[data-action='page']");
        if (!button) return;
        const page = Number(button.dataset.page);
        if (!button.classList.contains("disabled")) {
            goToPage(page);
        }
    });

    elements.studentModal.addEventListener("click", event => {
        if (event.target === elements.studentModal) {
            closeModal();
        }
    });

    elements.confirmModal.addEventListener("click", event => {
        if (event.target === elements.confirmModal) {
            closeConfirmModal();
        }
    });

    window.addEventListener("scroll", () => {
        if (syncMenuWithScroll.ticking) {
            return;
        }

        syncMenuWithScroll.ticking = true;
        window.requestAnimationFrame(() => {
            syncMenuWithScroll();
            syncMenuWithScroll.ticking = false;
        });
    }, { passive: true });

    window.addEventListener("resize", syncMenuWithScroll);

    window.addEventListener("focus", () => {
        if (!state.currentUser || state.currentUser.role === "STUDENT") return;
        if (state.activeSection !== "dashboard" && state.activeSection !== "students") return;

        refreshAdminData().catch(error => showToast(error.message, true));
    });
}

async function initializeApp() {
    bindEvents();
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    try {
        await loadCurrentUser();
        applyRoleUI();

        if (state.currentUser.role === "STUDENT") {
            await loadProfile();
        } else {
            elements.keywordInput.value = "";
            state.currentPage = 0;
            await loadStaffData("");
        }

        navigateToSection(getDefaultSection(), { instant: true });
        syncMenuWithScroll();
    } catch (error) {
        showToast(error.message, true);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
} else {
    initializeApp();
}
