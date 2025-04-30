document.addEventListener('DOMContentLoaded', async () => {
    // Получаем элементы навигации и контейнеры
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    const lessonTitle = document.getElementById('lesson-title');
    const lessonDescription = document.getElementById('lesson-description');
    const tasksContainer = document.getElementById('tasks-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');

    // Проверяем существование элементов
    if (!lessonsBtn || !tasksBtn || !lessonTitle || !lessonDescription || !tasksContainer || !loadingIndicator || !errorMessage) {
        console.error('Required elements not found');
        return;
    }

    // Получаем параметры из URL
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('id');

    if (!lessonId) {
        showError('Ошибка: ID урока не указан');
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

    // Загружаем данные урока
    async function loadLessonData() {
        showLoading();
        try {
            const response = await fetch(`/api/v0/lessons/lesson/${lessonId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const lesson = data.result;

            // Отображаем содержимое урока
            lessonTitle.textContent = lesson.title;
            lessonDescription.value = lesson.description;

            // Загружаем список задач урока
            await loadLessonTasks();
            hideLoading();
        } catch (error) {
            console.error('Error loading lesson data:', error);
            showError('Ошибка при загрузке данных урока');
        }
    }

    // Загружаем список задач урока
    async function loadLessonTasks() {
        try {
            const response = await fetch(`/api/v0/tasks/tasks/${lessonId}/tasks`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const tasks = data.tasks || [];

            tasksContainer.innerHTML = '';

            if (tasks.length === 0) {
                const noTasksDiv = document.createElement('div');
                noTasksDiv.className = 'col-12';
                noTasksDiv.innerHTML = '<p class="text-center">В этом уроке пока нет задач</p>';
                tasksContainer.appendChild(noTasksDiv);
                return;
            }

            // Создаем элементы для каждой задачи
            tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.className = 'col-12';
                taskDiv.innerHTML = `
                    <div class="card" style="border-radius:28px;width:811px;margin-left:72px;height:auto;min-height:50px;">
                        <div class="card-body" style="border-radius:0px;">
                            <button class="btn d-lg-flex justify-content-lg-center my-btn task-btn" 
                                    data-task-id="${task.id}" 
                                    style="width: 250px;margin-left: 88px;">
                                ${task.title || `Задание ${task.id}`}
                            </button>
                            <div class="card status-indicator" 
                                 style="width: 38px;height: 38px;border-radius: 32px;margin-top: -38px;margin-left: 536px;background: ${getStatusColor(task.status)};">
                            </div>
                        </div>
                    </div>
                `;

                // Добавляем обработчик клика на кнопку задачи
                const taskButton = taskDiv.querySelector('.task-btn');
                taskButton.addEventListener('click', () => {
                    window.location.href = `student_task_n_page.html?task_id=${task.id}&lesson_id=${lessonId}`;
                });

                tasksContainer.appendChild(taskDiv);
            });
        } catch (error) {
            console.error('Error loading lesson tasks:', error);
            showError('Ошибка при загрузке списка задач');
        }
    }

    // Функция для получения цвета статуса
    function getStatusColor(status) {
        switch (status) {
            case 'completed':
                return 'rgb(0, 255, 0)'; // Зеленый
            case 'in_progress':
                return 'rgb(255, 255, 0)'; // Желтый
            default:
                return 'rgb(255, 0, 0)'; // Красный
        }
    }

    // Добавляем обработчики навигации
    lessonsBtn.addEventListener('click', () => {
        window.location.href = 'student_main_page.html';
    });

    tasksBtn.addEventListener('click', () => {
        window.location.href = 'student_tasks_page.html';
    });

    // Загружаем данные урока
    loadLessonData();
});
