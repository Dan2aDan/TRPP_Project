document.addEventListener('DOMContentLoaded', async () => {
    // Получаем элементы навигации и формы
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    const taskTitle = document.getElementById('lesson-title');
    const taskDescription = document.getElementById('lesson-description');
    const solutionTextarea = document.getElementById('lesson-description-1');
    const sendBtn = document.getElementById('send_btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const logoutBtn = document.getElementById('logout-btn');

    // Проверяем существование элементов
    if (!lessonsBtn || !tasksBtn || !taskTitle || !taskDescription || !solutionTextarea || !sendBtn || !loadingIndicator || !errorMessage) {
        console.error('Required elements not found');
        return;
    }

    // Получаем параметры из URL
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('task_id');

    if (!taskId) {
        showError('Ошибка: ID задачи или урока не указан');
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

    // Загружаем данные задачи
    async function loadTaskData() {
        showLoading();
        try {
            const response = await fetch(`/api/v0/tasks/tasks/${taskId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const task = data.result;

            // Заполняем форму данными задачи
            taskTitle.textContent = task.title || `Задание ${task.id}`;
            taskDescription.value = task.description;
            if (task.description) taskDescription.classList.add('filled');
            else taskDescription.classList.remove('filled');
            solutionTextarea.value = task.solution || '';
            if (task.solution) solutionTextarea.classList.add('filled');
            else solutionTextarea.classList.remove('filled');

            hideLoading();
        } catch (error) {
            console.error('Error loading task data:', error);
            showError('Ошибка при загрузке данных задачи');
        }
    }

    // Обработчик отправки решения
    async function handleTaskSubmit(event) {
        event.preventDefault();
        
        const solutionText = document.getElementById('lesson-description-1').value.trim();
        if (!solutionText) {
            showError('Пожалуйста, введите решение');
            return;
        }
        
        try {
            showLoading();
            
            const response = await fetch('/api/v0/solutions/student_solutions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    task_id: taskId,
                    text: solutionText
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Ошибка при отправке решения');
            }
            
            const result = await response.json();
            
            // Очищаем поле ввода
            document.getElementById('lesson-description-1').value = '';
            
            // Обновляем список решений
            await loadSolutionsHistory();
            
            // Показываем сообщение об успехе
            showSuccess('Решение успешно отправлено');
        } catch (error) {
            console.error('Ошибка:', error);
            showError(error.message || 'Не удалось отправить решение');
        } finally {
            hideLoading();
        }
    }

    // Функция для отображения сообщения об успехе
    function showSuccess(message) {
        const successElement = document.createElement('div');
        successElement.className = 'alert alert-success';
        successElement.textContent = message;
        
        const mainCard = document.querySelector('.task-main-card');
        mainCard.insertBefore(successElement, mainCard.firstChild);
        
        // Удаляем сообщение через 3 секунды
        setTimeout(() => {
            successElement.remove();
        }, 3000);
    }

    // Добавляем обработчики событий
    lessonsBtn.addEventListener('click', () => {
        window.location.href = 'student_main_page.html';
    });

    tasksBtn.addEventListener('click', () => {
        window.location.href = 'student_tasks_page.html';
    });

    sendBtn.addEventListener('click', handleTaskSubmit);

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
            // Сначала получаем задачу
            const taskResponse = await fetch(`/api/v0/tasks/tasks/${taskId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!taskResponse.ok) {
                throw new Error(`HTTP error! status: ${taskResponse.status}`);
            }

            const taskData = await taskResponse.json();
            const fileId = taskData.result.task_file;

            if (!fileId) {
                showError('У этой задачи нет прикрепленных файлов');
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
            let filename = `task_${fileId}.png`;
            
            if (contentDisposition) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    const originalName = matches[1].replace(/['"]/g, '');
                    const extension = originalName.split('.').pop();
                    filename = `task_${fileId}.${extension}`;
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

    // Загружаем данные задачи
    loadTaskData();

    // Функция для загрузки истории решений
    async function loadSolutionsHistory() {
        try {
            const response = await fetch(`/api/v0/solutions/student_solutions/task/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Ошибка при загрузке истории решений');
            }
            
            const solutions = await response.json();
            displaySolutions(solutions.result);
        } catch (error) {
            console.error('Ошибка:', error);
            showError('Не удалось загрузить историю решений');
        }
    }

    // Функция для отображения решений
    function displaySolutions(solutions) {
        const solutionsList = document.getElementById('solutions-list');
        solutionsList.innerHTML = '';
        
        solutions.forEach(solution => {
            const solutionElement = createSolutionElement(solution);
            solutionsList.appendChild(solutionElement);
        });
    }

    // Функция для создания элемента решения
    function createSolutionElement(solution) {
        const div = document.createElement('div');
        div.className = 'solution-item';
        div.onclick = () => navigateToSolution(solution.id);
        
        const statusClass = getStatusClass(solution.state);
        const statusText = getStatusText(solution.state);
        
        div.innerHTML = `
            <div class="solution-header">
                <span class="solution-date">${formatDate(solution.created_at)}</span>
                <span class="solution-status ${statusClass}">${statusText}</span>
            </div>
            <div class="solution-preview">${solution.text}</div>
        `;
        
        return div;
    }

    // Функция для получения класса статуса
    function getStatusClass(state) {
        switch (state) {
            case 3: return 'status-success';
            case 4: return 'status-failure';
            default: return 'status-pending';
        }
    }

    // Функция для получения текста статуса
    function getStatusText(state) {
        switch (state) {
            case 3: return 'Успешно';
            case 4: return 'Ошибка';
            default: return 'В обработке';
        }
    }

    // Функция для форматирования даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Функция для перехода на страницу решения
    function navigateToSolution(solutionId) {
        window.location.href = `/student/solution/${solutionId}`;
    }

    // Добавляем загрузку истории решений при загрузке страницы
    loadSolutionsHistory();
});
