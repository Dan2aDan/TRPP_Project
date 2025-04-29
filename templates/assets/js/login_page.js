document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginButton = document.getElementById("log_btn");
    const errorMessage = document.getElementById("error-message");

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const login = document.getElementById("login").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!login || !password) {
            errorMessage.textContent = "Введите логин и пароль!";
            errorMessage.style.display = "block";
            return;
        }

        errorMessage.style.display = "none";

        // Добавляем спиннер и блокируем кнопку
        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Входим...';

        // Отправляем запрос на сервер
        fetch("/api/v0/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"login": login, "password": password}),
        })
            .then((response) => {
                if (response.ok) {
                    // Переход на новую страницу после успешного входа
                    window.location.href = "teacher_main_page.html";  // Переходим на нужную страницу
                } else {
                    errorMessage.textContent = "Неверный логин или пароль";
                    errorMessage.style.display = "block";
                }
            })
            .catch(() => {
                errorMessage.textContent = "Ошибка сервера.";
                errorMessage.style.display = "block";
            })
            .finally(() => {
                // Возвращаем кнопку обратно
                loginButton.disabled = false;
                loginButton.innerHTML = "Войти";
            });
    });
});
