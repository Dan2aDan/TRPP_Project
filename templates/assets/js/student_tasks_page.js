document.addEventListener('DOMContentLoaded', async () => {
    // Получаем элементы навигации и контейнер для задач
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    const tasksContainer = document.getElementById('tasks-container');
    const errorMessage = document.getElementById('error-message');
    const loadingIndicator = document.getElementById('loading-indicator');
    const filterSelect = document.getElementById('filter-select');

    // Проверяем существование элементов
    if (!lessonsBtn || !tasksBtn || !tasksContainer || !errorMessage || !loadingIndicator || !filterSelect) {
        console.error('Required elements not found');
        return;
    }

    // Проверяем авторизацию
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'login_page.html';
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

    // Загружаем список задач
    async function loadTasks() {
        showLoading();
        try {
            const response = await fetch('/api/v0/tasks/student_tasks', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const tasks = data.tasks || [];

            // Очищаем контейнер
            tasksContainer.innerHTML = '';

            if (tasks.length === 0) {
                tasksContainer.innerHTML = '<p class="no-tasks">Нет доступных задач</p>';
                hideLoading();
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
                    <div class="task-meta">
                        <span class="task-lesson">Урок: ${task.lesson_title || 'Не указан'}</span>
                        <span class="task-date">Создана: ${new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="task-description">${task.description}</p>
                    <button class="btn btn-primary start-task" data-id="${task.id}">
                        ${task.status === 'completed' ? 'Просмотреть' : 'Начать выполнение'}
                    </button>
                `;

                const startButton = taskElement.querySelector('.start-task');
                startButton.addEventListener('click', () => {
                    window.location.href = `student_task_n_page.html?task_id=${task.id}`;
                });

                tasksContainer.appendChild(taskElement);
            });
            hideLoading();
        } catch (error) {
            console.error('Error loading tasks:', error);
            showError('Ошибка при загрузке списка задач');
        }
    }

    // Обработчик изменения фильтра
    filterSelect.addEventListener('change', () => {
        const filterValue = filterSelect.value;
        const taskItems = tasksContainer.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            const status = item.querySelector('.task-status').textContent.toLowerCase();
            if (filterValue === 'all' || status === filterValue) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Добавляем обработчики навигации
    lessonsBtn.addEventListener('click', () => {
        window.location.href = 'student_main_page.html';
    });

    tasksBtn.addEventListener('click', () => {
        window.location.href = 'student_tasks_page.html';
    });

    // Загружаем задачи
    loadTasks();
});

