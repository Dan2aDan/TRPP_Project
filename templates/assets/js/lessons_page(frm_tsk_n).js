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
    const container = document.getElementById("students-container");
    if (!container) return;

    try {
        // Получаем список уроков
        const lessonsResp = await fetch("/api/v0/lessons/lessons");
        const lessonsData = await lessonsResp.json();

        if (!lessonsResp.ok || !Array.isArray(lessonsData.lessons)) {
            console.error("Ошибка получения уроков");
            return;
        }

        // Очищаем старый список
        container.innerHTML = "";

        // Для каждого урока создаём кнопку и вешаем обработчик
        lessonsData.lessons.forEach(lesson => {
            const btn = document.createElement("button");
            btn.className = "btn link-dark my-btn";
            btn.textContent = `Урок ${lesson.id} - ${lesson.title}`;
            btn.style.width = "500px";
            btn.style.height = "50px";
            btn.style.marginBottom = "10px";

            const wrapper = document.createElement("div");
            wrapper.className = "col-lg-11 col-xl-12 col-xxl-12 d-lg-flex justify-content-lg-start align-items-lg-center";
            wrapper.style.height = "51px";
            wrapper.style.width = "500px";
            wrapper.style.padding = "0px";

            wrapper.appendChild(btn);
            container.appendChild(wrapper);

            // Вешаем обработчик на кнопку
            btn.addEventListener("click", async () => {
                try {
                    // Получаем всех студентов
                    const params = new URLSearchParams(window.location.search);
                    const state = params.get('id');
                    const studentIds = [parseInt(state)]

                    // Отправляем запрос на установку зависимостей
                    const depResp = await fetch("/api/v0/lessons/dependencies", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            lesson_id: lesson.id,
                            student_ids: studentIds
                        })
                    });

                    if (!depResp.ok) {
                        const err = await depResp.json();
                        console.error("Ошибка:", err);
                        alert("Не удалось установить зависимости");
                    } else {
                        alert(`Зависимости для урока "${lesson.title}" успешно установлены`);
                    }

                } catch (err) {
                    console.error("Ошибка при обработке урока:", err);
                }
            });
        });

    } catch (err) {
        console.error("Ошибка при инициализации:", err);
    }
});
