// Функция для загрузки списка уроков с сервера
async function loadLessons() {
    try {
        // Загружаем список уроков с сервера
        const response = await fetch('/api/v0/lessons/lessons', {method: 'GET'});
        const lessons = await response.json();

        const container = document.getElementById('students-container'); // Контейнер на странице
        container.innerHTML = ''; // Очищаем старые уроки

        lessons.lessons.forEach(lesson => {
            const lessonHTML = `
        <div class="col-lg-11 col-xl-12 col-xxl-12 d-lg-flex justify-content-lg-start align-items-lg-center" style="height: 51px;width: 500px;padding: 5px;">
            <button class="btn link-dark my-btn lesson-btn" type="button" style="width: 500px;height: 50px;padding: 1px;" data-id="${lesson.id}">
                ${lesson.title}
            </button>
        </div>`;

            container.insertAdjacentHTML('beforeend', lessonHTML);
        });

// Добавляем обработчики событий для кнопок "Посмотреть урок"
        document.querySelectorAll('.lesson-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                console.trace('Клик по уроку');
                const lessonId = event.currentTarget.getAttribute('data-id');
                viewLesson(lessonId);
            });
        });
    } catch (error) {
        console.error('Ошибка загрузки списка уроков:', error);
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', loadLessons);

// Обработчики событий для кнопок навигации
document.getElementById('btn_students').addEventListener('click', () => {
    window.location.href = 'teacher_main_page.html';
});

document.getElementById('btn_lsns').addEventListener('click', () => {
    window.location.href = 'lessons_page.html';
});

document.getElementById('btn_tsks').addEventListener('click', () => {
    window.location.href = 'tasks_page.html';
});

// Функция для просмотра подробностей урока
function viewLesson(lessonId) {
    console.log('Просмотр урока с ID:', lessonId);
    window.location.href = `lesson_n_page.html?id=${lessonId}`;
}

// Функция для добавления нового урока
async function addLesson() {
    const lessonName = prompt("Введите название нового урока");
    if (lessonName) {
        try {
            const response = await fetch('/api/v0/lessons/lessons', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({title: lessonName, description: "Новый урок"})
            });
            if (response.ok) {
                alert('Урок добавлен');
                loadLessons(); // Перезагружаем список уроков после добавления
            } else {
                alert('Ошибка при добавлении урока');
            }
        } catch (error) {
            console.error('Ошибка при добавлении урока:', error);
            alert('Произошла ошибка при добавлении урока');
        }
    }
}

// Добавляем обработчик для кнопки "Добавить урок"
document.getElementById('btn_new_lsn').addEventListener('click', addLesson);