document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginButton = document.getElementById("log_btn");
    const errorMessage = document.getElementById("error-message");
    const loginInput = document.getElementById("login");
    const passwordInput = document.getElementById("password");

    if (!loginForm || !loginButton || !errorMessage || !loginInput || !passwordInput) {
        console.error('Required elements not found');
        return;
    }

    // Функция для отображения сообщения об ошибке
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }

    // Функция для скрытия сообщения об ошибке
    function hideError() {
        errorMessage.style.display = "none";
    }

    // Функция для блокировки кнопки и показа спиннера
    function setLoading(isLoading) {
        loginButton.disabled = isLoading;
        loginButton.innerHTML = isLoading 
            ? '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Входим...'
            : 'Войти';
    }

    // Функция для валидации ввода
    function validateInput(login, password) {
        if (!login || !password) {
            showError("Введите логин и пароль!");
            return false;
        }

        if (login.length < 3) {
            showError("Логин должен содержать минимум 3 символа");
            return false;
        }

        if (password.length < 6) {
            showError("Пароль должен содержать минимум 6 символов");
            return false;
        }

        return true;
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const login = loginInput.value.trim();
        const password = passwordInput.value.trim();

        hideError();

        if (!validateInput(login, password)) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/v0/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    login: login,
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                showError(errorData.message || "Неверный логин или пароль");
                return;
            }

            const responseData = await response.json();
            const userData = responseData.result;

            // Сохраняем токен и ID пользователя
            localStorage.setItem('token', userData.token);
            if (userData.id) {
                localStorage.setItem('studentId', userData.id);
            }

            // Определяем тип пользователя и перенаправляем
            const userType = userData.state;
            const redirectUrl = !userType
                ? 'student_main_page.html' 
                : 'teacher_main_page.html';
            
            window.location.href = redirectUrl;
        } catch (error) {
            console.error('Login error:', error);
            showError("Ошибка сервера. Пожалуйста, попробуйте позже.");
        } finally {
            setLoading(false);
        }
    });

    // Очистка сообщения об ошибке при вводе
    loginInput.addEventListener('input', hideError);
    passwordInput.addEventListener('input', hideError);
});
