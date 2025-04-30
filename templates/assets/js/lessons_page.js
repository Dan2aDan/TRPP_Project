document.addEventListener('DOMContentLoaded', async () => {
    // Получаем элементы навигации и контейнеры
    const studentsBtn = document.getElementById('btn_students');
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    const addLessonBtn = document.getElementById('btn_new_lsn');
    const lessonsContainer = document.getElementById('students-container');
    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message';
    errorMessage.style.cssText = 'display: none; color: red; margin: 10px;';
    document.querySelector('.col-md-12.col-lg-12.col-xl-10.col-xxl-8').appendChild(errorMessage);

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.style.cssText = 'display: none; text-align: center; margin: 20px;';
    loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div>';
    document.querySelector('.col-md-12.col-lg-12.col-xl-10.col-xxl-8').appendChild(loadingIndicator);

    // Проверяем существование элементов
    if (!studentsBtn || !lessonsBtn || !tasksBtn || !addLessonBtn || !lessonsContainer) {
        console.error('Required elements not found');
        return;
    }

    // Функция для отображения сообщения об ошибке
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        loadingIndicator.style.display = 'none';
    }

    // Функция для скрытия сообщения об ошибке
    function hideError() {
        errorMessage.style.display = 'none';
    }

    // Функция для отображения индикатора загрузки
    function showLoading() {
        loadingIndicator.style.display = 'block';
        hideError();
    }

    // Функция для скрытия индикатора загрузки
    function hideLoading() {
        loadingIndicator.style.display = 'none';
    }

    // Функция для загрузки списка уроков
    async function loadLessons() {
        showLoading();
        try {
            const response = await fetch('/api/v0/lessons/lessons', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const lessons = data.lessons || [];

            lessonsContainer.innerHTML = '';

            if (lessons.length === 0) {
                lessonsContainer.innerHTML = '<p class="no-lessons">Нет доступных уроков</p>';
                hideLoading();
                return;
            }

            lessons.forEach(lesson => {
                const lessonElement = document.createElement('div');
                lessonElement.className = 'col-lg-11 col-xl-12 col-xxl-12 d-lg-flex justify-content-lg-start align-items-lg-center';
                lessonElement.style.cssText = 'height: 51px; width: 500px; padding: 5px;';

                lessonElement.innerHTML = `
                    <button class="btn link-dark my-btn lesson-btn" type="button" 
                            style="width: 500px; height: 50px; padding: 1px;" 
                            data-id="${lesson.id}">
                        <div class="lesson-info">
                            <span class="lesson-title">${lesson.title}</span>
                            <span class="lesson-date">Создан: ${new Date(lesson.created_at).toLocaleDateString()}</span>
                        </div>
                    </button>
                `;

                const lessonButton = lessonElement.querySelector('.lesson-btn');
                lessonButton.addEventListener('click', () => viewLesson(lesson.id));

                lessonsContainer.appendChild(lessonElement);
            });
            hideLoading();
        } catch (error) {
            console.error('Ошибка загрузки списка уроков:', error);
            showError('Ошибка при загрузке списка уроков');
        }
    }

    // Функция для просмотра урока
    function viewLesson(lessonId) {
        window.location.href = `lesson_n_page.html?id=${lessonId}`;
    }

    // Функция для добавления нового урока
    async function addLesson() {
        const lessonName = prompt("Введите название нового урока");
        
        if (!lessonName) {
            return;
        }

        if (lessonName.length < 3) {
            showError('Название урока должно содержать минимум 3 символа');
            return;
        }

        showLoading();
        try {
            const response = await fetch('/api/v0/lessons/lessons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    title: lessonName,
                    description: "Новый урок"
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert('Урок успешно добавлен');
            await loadLessons();
        } catch (error) {
            console.error('Ошибка при добавлении урока:', error);
            showError('Ошибка при добавлении урока');
        }
    }

    // Добавляем обработчики навигации
    studentsBtn.addEventListener('click', () => {
        window.location.href = 'teacher_main_page.html';
    });

    lessonsBtn.addEventListener('click', () => {
        window.location.href = 'lessons_page.html';
    });

    tasksBtn.addEventListener('click', () => {
        window.location.href = 'tasks_page.html';
    });

    // Добавляем обработчик для кнопки добавления урока
    addLessonBtn.addEventListener('click', addLesson);

    // Загружаем список уроков
    await loadLessons();
});