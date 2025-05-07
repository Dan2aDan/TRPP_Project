document.getElementById('btn_students').addEventListener('click', () => {
    window.location.href = 'teacher_main_page.html';
});

document.getElementById('btn_lsns').addEventListener('click', () => {
    window.location.href = 'lessons_page.html';
});

document.getElementById('btn_tsks').addEventListener('click', () => {
    window.location.href = 'tasks_page.html';
});

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("lessons-container");
    if (!container) return;
    const params = new URLSearchParams(window.location.search);
    const state = params.get('id');
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Вы действительно хотите выйти?')) {
                try {
                    await fetch('/api/v0/auth/logout', { method: 'POST', credentials: 'include' });
                } catch (e) {}
                window.location.href = 'login.html';
            }
        });
    }
    try {
        const lessonsResp = await fetch("/api/v0/lessons/lessons");
        const lessonsData = await lessonsResp.json();
        const lessonsdeps = await (await fetch(`/api/v0/lessons/student/${state}`)).json();
        console.trace(lessonsdeps);
        if (!lessonsResp.ok || !Array.isArray(lessonsData.lessons)) {
            console.error("Ошибка получения уроков");
            return;
        }

// Для каждого урока создаём чекбокс и вешаем обработчик
        lessonsData.lessons.forEach(lesson => {
            const wrapper = document.createElement("div");
            wrapper.className = "main-card";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `lesson-${lesson.id}`;
            checkbox.className = "lesson-checkbox";
            if (lessonsdeps.result.some(dep => dep.id === lesson.id)) {
                checkbox.checked = true;
            }

            const label = document.createElement("label");
            label.htmlFor = `lesson-${lesson.id}`;
            label.textContent = lesson.title;

            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            container.appendChild(wrapper);

            // Вешаем обработчик на изменение статуса чекбокса
            checkbox.addEventListener("change", async () => {
                try {
                    // Получаем всех студентов


                    // Отправляем запрос на установку зависимостей
                    const depResp = await fetch("/api/v0/lessons/dependencies", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            lesson_id: lesson.id,
                            student_id: state,
                            state: checkbox.checked
                        })
                    });

                    if (!depResp.ok) {
                        const err = await depResp.json();
                        console.error("Ошибка:", err);
                        alert("Не удалось установить зависимости");
                    } else {
                        alert(`Зависимости для урока "${lesson.title}" успешно ${checkbox.checked ? 'установлены' : 'сняты'}`);
                    }

                } catch (err) {
                    console.error("Ошибка при обработке урока:", err);
                    alert("Произошла ошибка при обработке запроса");
                }
            });
        });
    } catch
        (err) {
        console.error("Ошибка при инициализации:", err);
    }
})
;
