document.addEventListener('DOMContentLoaded', async () => {
    // Получаем элементы навигации
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    const tasksList = document.getElementById('tasks-list');

    // Проверяем существование элементов
    if (!lessonsBtn || !tasksBtn || !tasksList) {
        console.error('Required elements not found');
        return;
    }

    // Добавляем обработчики навигации
    lessonsBtn.addEventListener('click', () => {
        window.location.href = 'student_main_page.html';
    });

    tasksBtn.addEventListener('click', () => {
        window.location.href = 'student_tasks_page.html';
    });

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

    // Функция для отображения сообщения об ошибке
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.textContent = message;
        tasksList.appendChild(errorDiv);
    }

    // Функция для отображения индикатора загрузки
    function showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-center';
        loadingDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div>';
        tasksList.appendChild(loadingDiv);
    }

    // Функция для скрытия индикатора загрузки
    function hideLoading() {
        const loadingDiv = tasksList.querySelector('.spinner-border');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    // Загрузка задач студента
    async function loadStudentTasks() {
        tasksList.innerHTML = '';
        try {
            // Получаем информацию о текущем пользователе
            const currentUserResponse = await fetch('/api/v0/auth/current', {
                credentials: 'include'
            });

            if (!currentUserResponse.ok) {
                throw new Error(`HTTP error! status: ${currentUserResponse.status}`);
            }

            const currentUserData = await currentUserResponse.json();
            
            // Проверяем, что пользователь является студентом
            if (!currentUserData.result || !currentUserData.result.id) {
                throw new Error('Не удалось получить информацию о пользователе');
            }

            const studentId = currentUserData.result.id;

            // Получаем задачи студента
            const tasksResponse = await fetch(`/api/v0/tasks/student/${studentId}`, {
                credentials: 'include'
            });

            if (!tasksResponse.ok) {
                throw new Error(`HTTP error! status: ${tasksResponse.status}`);
            }

            const tasksData = await tasksResponse.json();
            const tasks = tasksData.tasks || [];

            if (tasks.length === 0) {
                const noTasksDiv = document.createElement('div');
                noTasksDiv.className = 'error-message';
                noTasksDiv.textContent = 'У вас пока нет задач';
                tasksList.appendChild(noTasksDiv);
                return;
            }

            // Создаем элементы для каждой задачи
            for (const task of tasks) {
                // Получаем статус задачи
                let statusData;
                try {
                    const statusResponse = await fetch(`/api/v0/lessons/task/${task.id}/status`, {
                        credentials: 'include'
                    });
                    if (!statusResponse.ok) {
                        throw new Error('Ошибка при загрузке статуса задачи');
                    }
                    statusData = await statusResponse.json();
                } catch (error) {
                    console.error('Ошибка при загрузке статуса задачи:', error);
                    statusData = { status: 'not-started', message: 'Не удалось загрузить статус' };
                }

                const taskCard = document.createElement('div');
                taskCard.className = 'task-card';

                const leftBlock = document.createElement('div');
                leftBlock.style.flex = '1';

                const title = document.createElement('div');
                title.className = 'task-title';
                title.textContent = task.title || `Задача ${task.id}`;

                const description = document.createElement('div');
                description.className = 'task-desc';
                description.textContent = task.description || 'Описание отсутствует';
                if (task.description) description.classList.add('filled');

                // const lessonInfo = document.createElement('div');
                // lessonInfo.className = 'task-desc';
                // lessonInfo.style.fontSize = '0.95em';
                // lessonInfo.style.color = '#888';
                // lessonInfo.textContent = `Урок: ${task.lesson_title || 'Неизвестный урок'}`;

                leftBlock.appendChild(title);
                leftBlock.appendChild(description);
                // leftBlock.appendChild(lessonInfo);

                const rightBlock = document.createElement('div');
                rightBlock.style.display = 'flex';
                rightBlock.style.alignItems = 'center';

                const statusIndicator = document.createElement('div');
                statusIndicator.className = 'task-status-indicator';
                
                // Устанавливаем класс и подсказку в зависимости от статуса
                switch (statusData.status) {
                    case 'completed':
                        statusIndicator.classList.add('task-status-completed');
                        statusIndicator.title = statusData.message || 'Задача решена';
                        break;
                    case 'in-progress':
                        statusIndicator.classList.add('task-status-in-progress');
                        statusIndicator.title = statusData.message || 'Задача в процессе';
                        break;
                    case 'not-started':
                        statusIndicator.classList.add('task-status-not-started');
                        statusIndicator.title = statusData.message || 'Задача не начата';
                        break;
                    default:
                        statusIndicator.classList.add('task-status-not-started');
                        statusIndicator.title = statusData.message || 'Задача не начата';
                }

                const openButton = document.createElement('button');
                openButton.className = 'open-task-btn';
                openButton.innerHTML = '<i class="fas fa-arrow-right"></i> Открыть';
                openButton.addEventListener('click', () => {
                    window.location.href = `student_task_n_page.html?task_id=${task.id}`;
                });

                rightBlock.appendChild(statusIndicator);
                rightBlock.appendChild(openButton);

                taskCard.appendChild(leftBlock);
                taskCard.appendChild(rightBlock);
                tasksList.appendChild(taskCard);
            }
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Ошибка при загрузке списка задач';
            tasksList.appendChild(errorDiv);
        }
    }

    // Загружаем задачи при загрузке страницы
    loadStudentTasks();
});

