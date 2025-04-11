// Функция для загрузки списка уроков с сервера
async function loadLessons() {
    try {
        // Загружаем список уроков с сервера
        const response = await fetch('/api/lessons'); // Замените на ваш эндпоинт
        const lessons = await response.json();

        const container = document.getElementById('students-container'); // Контейнер на странице
        const lessonsList = container.querySelector('.row'); // Секция для отображения уроков
        lessonsList.innerHTML = ''; // Очищаем старые уроки

        lessons.forEach(lesson => {
            const lessonHTML = `
            <div class="row" style="height: 51px;width: 501px;margin: 0;padding: 0;margin-top: 10px;margin-left: 230px;">
                <div class="col-lg-11 col-xl-12 col-xxl-12 d-lg-flex justify-content-lg-start align-items-lg-center" style="height: 51px;width: 500px;padding: 0;margin: 0;margin-left: 0;">
                    <button class="btn link-dark my-btn view-lesson" data-id="${lesson.id}" type="button" style="width: 500px;height: 50px;">${lesson.name}</button>
                </div>
            </div>`;
            
            lessonsList.insertAdjacentHTML('beforeend', lessonHTML);
        });

        // Добавляем обработчики событий для кнопок "Посмотреть урок"
        document.querySelectorAll('.view-lesson').forEach(button => {
            button.addEventListener('click', (event) => {
                const lessonId = event.target.getAttribute('data-id');
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
    window.location.href = `/lesson/details?id=${lessonId}`;
}

// Функция для добавления нового урока
async function addLesson() {
    const lessonName = prompt("Введите название нового урока");
    if (lessonName) {
        try {
            const response = await fetch('/api/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: lessonName })
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