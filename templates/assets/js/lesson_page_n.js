document.addEventListener('DOMContentLoaded', async () => {
    // Получаем элементы навигации и формы
    const studentsBtn = document.getElementById('btn_students');
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    const saveLessonBtn = document.getElementById('save-lesson');
    const deleteLessonBtn = document.getElementById('delete-lesson');
    const createTaskBtn = document.getElementById('create');
    const downloadFilesBtn = document.querySelector('.btn.my-btn[style*="margin-left:126px"]');
    const uploadFilesBtn = document.querySelector('.btn.my-btn[style*="margin-left:185px"]');
    const lessonTitle = document.getElementById('lesson-title');
    const lessonDescription = document.getElementById('lesson-description');
    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message';
    errorMessage.style.cssText = 'display: none; color: red; margin: 10px;';
    document.querySelector('.col-md-12.col-lg-12.col-xl-10.col-xxl-8').appendChild(errorMessage);

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.style.cssText = 'display: none; text-align: center; margin: 20px;';
    loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div>';
    document.querySelector('.col-md-12.col-lg-12.col-xl-10.col-xxl-8').appendChild(loadingIndicator);

    // Проверяем существование только необходимых элементов
    if (!studentsBtn || !lessonsBtn || !tasksBtn || !saveLessonBtn || !deleteLessonBtn || 
        !createTaskBtn || !downloadFilesBtn || !uploadFilesBtn || !lessonTitle || 
        !lessonDescription) {
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
            const container = document.querySelector('.row > .col > .card')?.parentElement;

            if (!container) {
                throw new Error('Container for tasks not found');
            }

            // Очищаем контейнер
            container.innerHTML = '';

            if (tasks.length === 0) {
                container.innerHTML = '<p class="no-tasks">В этом уроке пока нет задач</p>';
                hideLoading();
                return;
            }

            // Создаем элементы для каждой задачи
            tasks.forEach(task => {
                const card = document.createElement('div');
                card.className = 'card';
                card.style.cssText = 'border-radius:28px;width:811px;margin-left:72px;height:auto;min-height:50px;margin-bottom:10px;';

                card.innerHTML = `
                    <div class="card-body" style="border-radius:0px;">
                        <button class="btn my-btn show-btn" type="button" data-task-id="${task.id}" style="width:250px;margin-right:220px;">
                            ${task.title || `Задача ${task.id}`}
                        </button>
                        <button class="btn my-btn delete-task-btn" type="button" style="width:250px;" data-task-id="${task.id}">
                            Удалить задачу
                        </button>
                    </div>
                `;

                container.appendChild(card);
            });

            // Добавляем обработчики для кнопок просмотра
            document.querySelectorAll('.show-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const taskId = btn.getAttribute('data-task-id');
                    window.location.href = `/templates/tasks_n_page.html?state=${taskId}`;
                });
            });

            // Добавляем обработчики для кнопок удаления
            document.querySelectorAll('.delete-task-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const taskId = btn.getAttribute('data-task-id');
                    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
                        return;
                    }

                    try {
                        const response = await fetch(`/api/v0/tasks/tasks/${taskId}`, {
                            method: 'DELETE',
                            credentials: 'include'
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        await loadTasks();
                    } catch (error) {
                        console.error('Ошибка при удалении задачи:', error);
                        showError('Ошибка при удалении задачи');
                    }
                });
            });
            hideLoading();
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
            showError('Ошибка при загрузке списка задач');
        }
    }

    // Обработчик скачивания файлов
    downloadFilesBtn.addEventListener('click', async () => {
        // showLoading();
        try {
            const response = await fetch(`/api/v0/lessons/lesson/${lessonId}/files`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lesson_${lessonId}_files.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            hideLoading();
        } catch (error) {
            console.error('Ошибка при скачивании файлов:', error);
            showError('Ошибка при скачивании файлов');
        }
    });

    // Обработчик загрузки файлов
    uploadFilesBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '*/*';
        
        input.addEventListener('change', async (event) => {
            const files = event.target.files;
            if (files.length === 0) return;

            showLoading();
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            try {
                const response = await fetch(`/api/v0/lessons/lesson/${lessonId}/files`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                alert('Файлы успешно загружены');
                hideLoading();
            } catch (error) {
                console.error('Ошибка при загрузке файлов:', error);
                showError('Ошибка при загрузке файлов');
            }
        });

        input.click();
    });

    // Обработчик сохранения урока
    saveLessonBtn.addEventListener('click', async () => {
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
    deleteLessonBtn.addEventListener('click', async () => {
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
    createTaskBtn.addEventListener('click', () => {
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