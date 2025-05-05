document.addEventListener('DOMContentLoaded', async () => {
    // Получаем элементы навигации и контейнеры
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    const lessonTitle = document.getElementById('lesson-title');
    const lessonDescription = document.getElementById('lesson-description');
    const tasksContainer = document.getElementById('tasks-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const logoutBtn = document.getElementById('logout-btn');

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

    // Получаем кнопку для скачивания файлов
    const downloadFilesBtn = document.getElementById('download-files-btn');

    if (!downloadFilesBtn) {
        console.error('Download button not found');
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
        try {
            const lessonId = new URLSearchParams(window.location.search).get('id');
            if (!lessonId) {
                throw new Error('ID урока не указан');
            }

            // Загружаем данные урока
            const lessonResponse = await fetch(`/api/v0/lessons/lesson/${lessonId}`, {
                credentials: 'include'
            });
            if (!lessonResponse.ok) {
                throw new Error('Ошибка при загрузке урока');
            }
            const lessonData = await lessonResponse.json();
            const lesson = lessonData.result;

            // Загружаем статус урока
            const statusResponse = await fetch(`/api/v0/lessons/lesson/${lessonId}/status`, {
                credentials: 'include'
            });
            if (!statusResponse.ok) {
                throw new Error('Ошибка при загрузке статуса урока');
            }
            const statusData = await statusResponse.json();

            // Обновляем заголовок и описание урока
            document.getElementById('lesson-title').textContent = lesson.title;
            document.getElementById('lesson-description').textContent = lesson.description;

            // Обновляем индикатор статуса урока
            const statusIndicator = document.getElementById('lesson-status-indicator');
            statusIndicator.className = 'status-indicator';
            statusIndicator.classList.add(`status-${statusData.status}`);
            statusIndicator.title = statusData.message;

            // Загружаем задачи урока
            await loadLessonTasks(lessonId);
        } catch (error) {
            console.error('Ошибка при загрузке данных урока:', error);
            showError(error.message);
        }
    }

    // Загружаем список задач урока
    async function loadLessonTasks(lessonId) {
        try {
            const tasksContainer = document.getElementById('tasks-container');
            tasksContainer.innerHTML = '';

            // Загружаем список задач урока
            const tasksResponse = await fetch(`/api/v0/tasks/tasks/${lessonId}/tasks`, {
                credentials: 'include'
            });
            if (!tasksResponse.ok) {
                throw new Error('Ошибка при загрузке списка задач');
            }
            const tasksData = await tasksResponse.json();
            const tasks = tasksData.tasks || [];

            if (tasks.length === 0) {
                tasksContainer.innerHTML = '<div class="no-tasks">В этом уроке пока нет задач</div>';
                return;
            }

            // Для каждой задачи загружаем её статус и создаем карточку
            for (const task of tasks) {
                const statusResponse = await fetch(`/api/v0/lessons/task/${task.id}/status`, {
                    credentials: 'include'
                });
                if (!statusResponse.ok) {
                    console.error(`Ошибка при загрузке статуса задачи ${task.id}`);
                    continue;
                }
                const statusData = await statusResponse.json();

                const taskCard = document.createElement('div');
                taskCard.className = 'task-card';
                taskCard.onclick = () => window.location.href = `student_task_n_page.html?task_id=${task.id}&lesson_id=${lessonId}`;

                const taskTitle = document.createElement('span');
                taskTitle.className = 'task-title';
                taskTitle.textContent = 'Задача ' + task.id;

                const statusIndicator = document.createElement('div');
                statusIndicator.className = 'task-status-indicator';
                
                // Устанавливаем класс и подсказку в зависимости от статуса
                switch (statusData.status) {
                    case 'completed':
                        statusIndicator.classList.add('task-status-completed');
                        statusIndicator.title = 'Задача решена';
                        break;
                    case 'in-progress':
                        statusIndicator.classList.add('task-status-in-progress');
                        statusIndicator.title = statusData.message;
                        break;
                    case 'not-started':
                        statusIndicator.classList.add('task-status-not-started');
                        statusIndicator.title = 'Задача не начата';
                        break;
                    default:
                        statusIndicator.classList.add('task-status-not-started');
                        statusIndicator.title = 'Задача не начата';
                }

                taskCard.appendChild(taskTitle);
                taskCard.appendChild(statusIndicator);
                tasksContainer.appendChild(taskCard);
            }
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
            showError(error.message);
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

    // Добавляем обработчик для кнопки logout-btn
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

    // Обработчик скачивания файлов
    downloadFilesBtn.addEventListener('click', async () => {
        showLoading();
        try {
            // Сначала получаем урок
            const lessonResponse = await fetch(`/api/v0/lessons/lesson/${lessonId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!lessonResponse.ok) {
                throw new Error(`HTTP error! status: ${lessonResponse.status}`);
            }

            const lessonData = await lessonResponse.json();
            const fileId = lessonData.result.file_id;

            if (!fileId) {
                showError('У этого урока нет прикрепленных файлов');
                return;
            }

            // Затем получаем файл по его ID
            const fileResponse = await fetch(`/api/v0/files/file/${fileId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!fileResponse.ok) {
                throw new Error(`HTTP error! status: ${fileResponse.status}`);
            }

            // Получаем имя файла из заголовка Content-Disposition или используем ID
            const contentDisposition = fileResponse.headers.get('Content-Disposition');
            let filename = `lesson_${fileId}.png`;
            
            if (contentDisposition) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    const originalName = matches[1].replace(/['"]/g, '');
                    const extension = originalName.split('.').pop();
                    filename = `lesson_${fileId}.${extension}`;
                }
            }

            const blob = await fileResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            hideLoading();
        } catch (error) {
            console.error('Ошибка при скачивании файлов:', error);
            showError('Ошибка при скачивании файлов');
            hideLoading();
        }
    });

    // Загружаем данные урока
    loadLessonData();
});
