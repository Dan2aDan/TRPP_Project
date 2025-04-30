document.addEventListener('DOMContentLoaded', async () => {
    // Получаем элементы навигации и контейнеры
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    const lessonContainer = document.getElementById('lesson-container');
    const tasksContainer = document.getElementById('tasks-container');
    const errorMessage = document.getElementById('error-message');
    const loadingIndicator = document.getElementById('loading-indicator');

    // Проверяем существование элементов
    if (!lessonsBtn || !tasksBtn || !lessonContainer || !tasksContainer || !errorMessage || !loadingIndicator) {
        console.error('Required elements not found');
        return;
    }

    // Проверяем авторизацию
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'login_page.html';
        return;
    }

    // Получаем параметры из URL
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('lesson_id');

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
            const response = await fetch(`/api/v0/lessons/${lessonId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const lesson = data.result;

            // Отображаем содержимое урока
            lessonContainer.innerHTML = `
                <div class="lesson-header">
                    <h2>${lesson.title}</h2>
                    <div class="lesson-meta">
                        <span class="lesson-date">Создан: ${new Date(lesson.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="lesson-content">
                    ${lesson.content}
                </div>
            `;

            // Загружаем список задач урока
            await loadLessonTasks(lesson.tasks || []);
            hideLoading();
        } catch (error) {
            console.error('Error loading lesson data:', error);
            showError('Ошибка при загрузке данных урока');
        }
    }

    // Загружаем список задач урока
    async function loadLessonTasks(tasks) {
        try {
            tasksContainer.innerHTML = '';

            if (tasks.length === 0) {
                tasksContainer.innerHTML = '<p class="no-tasks">В этом уроке пока нет задач</p>';
                return;
            }

            // Создаем элементы для каждой задачи
            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = 'task-item';
                taskElement.innerHTML = `
                    <div class="task-header">
                        <h3>${task.title}</h3>
                        <span class="task-status ${task.status || 'pending'}">${task.status || 'Не начато'}</span>
                    </div>
                    <p class="task-description">${task.description}</p>
                    <button class="btn btn-primary start-task" data-id="${task.id}">
                        ${task.status === 'completed' ? 'Просмотреть' : 'Начать выполнение'}
                    </button>
                `;

                const startButton = taskElement.querySelector('.start-task');
                startButton.addEventListener('click', () => {
                    window.location.href = `student_task_n_page.html?task_id=${task.id}&lesson_id=${lessonId}`;
                });

                tasksContainer.appendChild(taskElement);
            });
        } catch (error) {
            console.error('Error loading lesson tasks:', error);
            showError('Ошибка при загрузке списка задач');
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
