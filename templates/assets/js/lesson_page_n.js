document.addEventListener('DOMContentLoaded', async () => {
    // Навигация
    const studentsBtn = document.getElementById('btn_students');
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    // Кнопки действий
    const lessonActions = document.querySelectorAll('.lesson-actions .lesson-action-btn');
    const lessonActionsBottom = document.querySelectorAll('.lesson-actions-bottom .lesson-action-btn');
    // Основные поля
    const lessonTitle = document.getElementById('lesson-title');
    const lessonDescription = document.getElementById('lesson-description');
    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message';
    errorMessage.style.cssText = 'display: none; color: red; margin: 10px;';
    document.querySelector('.main-card').appendChild(errorMessage);

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.style.cssText = 'display: none; text-align: center; margin: 20px;';
    loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div>';
    document.querySelector('.main-card').appendChild(loadingIndicator);

    // Проверяем существование только необходимых элементов
    if (!studentsBtn || !lessonsBtn || !tasksBtn || lessonActions.length < 2 || lessonActionsBottom.length < 3 || !lessonTitle || !lessonDescription) {
        console.error('Required elements not found');
        return;
    }

    // Теперь используйте:
    // lessonActions[0] — Скачать файлы
    // lessonActions[1] — Загрузить файлы
    // lessonActionsBottom[0] — Прикрепить задачу
    // lessonActionsBottom[1] — Сохранить урок
    // lessonActionsBottom[2] — Удалить урок

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

    // Загрузка данных урока
    async function loadLesson() {
        showLoading();
        try {
            const response = await fetch(`/api/v0/lessons/lesson/${lessonId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const lesson = data.result;

            lessonTitle.textContent = `Урок: ${lesson.title}`;
            lessonDescription.value = lesson.description;
            hideLoading();
        } catch (error) {
            console.error('Ошибка при загрузке урока:', error);
            showError('Ошибка при загрузке данных урока');
        }
    }

    // Загрузка списка задач
    async function loadTasks() {
        showLoading();
        try {
            const response = await fetch(`/api/v0/tasks/tasks/${lessonId}/tasks`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const tasks = data.tasks || [];
            const tasksList = document.getElementById('tasks-list');
            tasksList.innerHTML = '';

            if (tasks.length === 0) {
                tasksList.innerHTML = '<p class="no-tasks">В этом уроке пока нет задач</p>';
                hideLoading();
                return;
            }

            renderTasks(tasks);
            hideLoading();
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
            showError('Ошибка при загрузке списка задач');
        }
    }
    async function deleteTask(taskId) {
        if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;
        try {
            const response = await fetch(`/api/v0/tasks/tasks/${taskId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            await loadTasks(); // обновить список задач после удаления
        } catch (error) {
            alert('Ошибка при удалении задачи');
            console.error(error);
        }
    }
    function renderTasks(tasks) {
        const tasksList = document.getElementById('tasks-list');
        tasksList.innerHTML = '';
        tasks.forEach(task => {
            const row = document.createElement('div');
            row.className = 'lesson-task-row';
            row.innerHTML = `
                <span class="lesson-task-title">${task.title || 'Задание'}</span>
                <div class="d-flex flex-wrap gap-2">
                    <button class="lesson-task-btn" onclick="window.location.href='tasks_n_page.html?state=${task.id}'">Открыть</button>
                    <button class="lesson-task-btn" onclick="deleteTask(${task.id})">Удалить</button>
                </div>
            `;
            tasksList.appendChild(row);
        });
    }

    // Обработчик скачивания файлов
    lessonActions[0].addEventListener('click', async () => {
        // showLoading();
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
            let filename = `lesson_${fileId}`;
            
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

    // Обработчик загрузки файлов
    lessonActions[1].addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.txt,.py,.java,.cpp,.cs,.js,.html,.css,.json,.xml,.md,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z';
        
        input.addEventListener('change', async (event) => {
            const files = event.target.files;
            if (files.length === 0) return;

            showLoading();
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Проверяем размер файла (максимум 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    alert(`Файл ${file.name} слишком большой. Максимальный размер - 10MB`);
                    continue;
                }
                formData.append('file', file);
                formData.append('bind_type', 'lesson');
                formData.append('bind_id', lessonId);
            }

            if (formData.getAll('file').length === 0) {
                hideLoading();
                return;
            }

            try {
                const response = await fetch('/api/v0/files/file', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.code === 201) {
                    alert('Файлы успешно загружены');
                } else {
                    throw new Error(data.msg || 'Ошибка при загрузке файлов');
                }
                hideLoading();
            } catch (error) {
                console.error('Ошибка при загрузке файлов:', error);
                showError('Ошибка при загрузке файлов');
                hideLoading();
            }
        });

        input.click();
    });

    // Обработчик сохранения урока
    lessonActionsBottom[1].addEventListener('click', async () => {
        showLoading();
        try {
            const response = await fetch(`/api/v0/lessons/lesson/${lessonId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    description: lessonDescription.value
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert('Урок успешно сохранен');
            hideLoading();
        } catch (error) {
            console.error('Ошибка при сохранении урока:', error);
            showError('Ошибка при сохранении урока');
        }
    });

    // Обработчик удаления урока
    lessonActionsBottom[2].addEventListener('click', async () => {
        if (!confirm('Вы уверены, что хотите удалить этот урок?')) {
            return;
        }

        showLoading();
        try {
            const response = await fetch(`/api/v0/lessons/lesson/${lessonId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            window.location.href = 'lessons_page.html';
        } catch (error) {
            console.error('Ошибка при удалении урока:', error);
            showError('Ошибка при удалении урока');
        }
    });

    // Обработчик создания задачи
    lessonActionsBottom[0].addEventListener('click', () => {
        window.location.href = `tasks_n_page.html?lesson_id=${lessonId}&state=-1`;
    });

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

    // Загружаем данные урока и задачи
    if (lessonId !== '-1') {
    await loadLesson();
    await loadTasks();}

    
});