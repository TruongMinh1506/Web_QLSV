const loginElements = {
    form: document.getElementById("loginForm"),
    username: document.getElementById("username"),
    password: document.getElementById("password"),
    button: document.getElementById("loginBtn"),
    error: document.getElementById("loginError")
};

async function loginRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    if (!response.ok || !payload || !payload.success) {
        throw new Error(payload && payload.message ? payload.message : "Không thể xử lý yêu cầu");
    }

    return payload.data;
}

function showLoginError(message) {
    loginElements.error.textContent = message;
    loginElements.error.classList.remove("hidden");
}

function clearLoginError() {
    loginElements.error.textContent = "";
    loginElements.error.classList.add("hidden");
}

async function checkExistingSession() {
    try {
        await loginRequest("/api/auth/me");
        window.location.replace("/app");
    } catch (error) {
        clearLoginError();
    }
}

async function handleLogin(event) {
    event.preventDefault();
    clearLoginError();

    loginElements.button.disabled = true;
    loginElements.button.textContent = "Đang đăng nhập...";

    try {
        await loginRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                username: loginElements.username.value.trim(),
                password: loginElements.password.value
            })
        });

        window.location.replace("/app");
    } catch (error) {
        showLoginError(error.message);
    } finally {
        loginElements.button.disabled = false;
        loginElements.button.textContent = "Đăng nhập";
    }
}

function initializeLoginPage() {
    loginElements.form.addEventListener("submit", handleLogin);
    checkExistingSession();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLoginPage, { once: true });
} else {
    initializeLoginPage();
}
