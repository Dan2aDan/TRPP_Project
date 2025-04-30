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
        showLoading();
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

            hideLoading();
            tasksList.innerHTML = '';

            if (tasks.length === 0) {
                const noTasksDiv = document.createElement('div');
                noTasksDiv.className = 'alert alert-info';
                noTasksDiv.textContent = 'У вас пока нет задач';
                tasksList.appendChild(noTasksDiv);
                return;
            }

            // Создаем элементы для каждой задачи
            tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.className = 'col-md-12 mb-3';
                taskDiv.style.marginBottom = '20px';

                const card = document.createElement('div');
                card.className = 'card';
                card.style.borderRadius = '28px';
                card.style.width = '811px';
                card.style.margin = '0 auto';
                card.style.height = 'auto';
                card.style.minHeight = '50px';

                const cardBody = document.createElement('div');
                cardBody.className = 'card-body';
                cardBody.style.borderRadius = '0px';

                const title = document.createElement('h5');
                title.className = 'card-title';
                title.textContent = task.title || `Задача ${task.id}`;

                const description = document.createElement('p');
                description.className = 'card-text';
                description.textContent = task.description || 'Описание отсутствует';

                const lessonInfo = document.createElement('p');
                lessonInfo.className = 'card-text';
                lessonInfo.style.fontSize = '0.9em';
                lessonInfo.style.color = '#666';
                lessonInfo.textContent = `Урок: ${task.lesson_title || 'Неизвестный урок'}`;

                const statusBadge = document.createElement('span');
                statusBadge.className = 'badge';
                statusBadge.style.marginLeft = '10px';
                statusBadge.style.float = 'right';

                if (task.status === 'completed') {
                    statusBadge.className += ' bg-success';
                    statusBadge.textContent = 'Выполнено';
                } else if (task.status === 'in_progress') {
                    statusBadge.className += ' bg-warning';
                    statusBadge.textContent = 'В процессе';
                } else {
                    statusBadge.className += ' bg-danger';
                    statusBadge.textContent = 'Не начато';
                }

                const openButton = document.createElement('button');
                openButton.className = 'btn btn-primary';
                openButton.textContent = 'Открыть задачу';
                openButton.style.marginTop = '10px';
                openButton.addEventListener('click', () => {
                    window.location.href = `student_task_n_page.html?task_id=${task.id}`;
                });

                cardBody.appendChild(title);
                cardBody.appendChild(statusBadge);
                cardBody.appendChild(description);
                cardBody.appendChild(lessonInfo);
                cardBody.appendChild(openButton);
                card.appendChild(cardBody);
                taskDiv.appendChild(card);
                tasksList.appendChild(taskDiv);
            });
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
            hideLoading();
            showError('Ошибка при загрузке списка задач');
        }
    }

    // Загружаем задачи при загрузке страницы
    loadStudentTasks();
});

