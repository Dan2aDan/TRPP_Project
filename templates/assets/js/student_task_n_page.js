document.addEventListener('DOMContentLoaded', async () => {
    // Получаем элементы навигации и контейнеры
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    const taskTitle = document.getElementById('task-title');
    const taskDescription = document.getElementById('task-description');
    const solutionsList = document.getElementById('solutions-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const logoutBtn = document.getElementById('logout-btn');
    const sendBtn = document.getElementById('send_btn');
    const taskAnswer = document.getElementById('task-answer');

    // Проверяем существование элементов
    if (!lessonsBtn || !tasksBtn || !taskTitle || !taskDescription || !solutionsList || !loadingIndicator || !errorMessage || !sendBtn || !taskAnswer) {
        console.error('Required elements not found');
        return;
    }

    // Получаем параметры из URL
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('task_id');

    if (!taskId) {
        showError('Ошибка: ID задачи не указан');
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
            // Загружаем данные задачи
            const taskResponse = await fetch(`/api/v0/tasks/tasks/${taskId}`, {
                credentials: 'include'
            });
            if (!taskResponse.ok) {
                throw new Error('Ошибка при загрузке задачи');
            }
            const taskData = await taskResponse.json();
            const task = taskData.result;

            // Обновляем заголовок и описание задачи
            taskTitle.textContent = 'Задание ' + task.id;
            taskDescription.textContent = task.description;

            // Загружаем решения задачи
            await loadTaskSolutions();

        } catch (error) {
            console.error('Ошибка при загрузке данных задачи:', error);
            showError(error.message);
        } finally {
            hideLoading();
        }
    }

    // Загружаем решения задачи
    async function loadTaskSolutions() {
        try {
            const solutionsResponse = await fetch(`/api/v0/solutions/student_solutions/task/${taskId}`, {
                credentials: 'include'
            });
            if (!solutionsResponse.ok) {
                throw new Error('Ошибка при загрузке решений');
            }
            const solutionsData = await solutionsResponse.json();
            const solutions = solutionsData.result || [];

            solutionsList.innerHTML = '';

            if (solutions.length === 0) {
                solutionsList.innerHTML = '<div class="no-solutions">Решений пока нет</div>';
                return;
            }

            // Сортируем решения по дате создания (новые сверху)
            solutions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            solutions.forEach(solution => {
                const solutionItem = document.createElement('div');
                solutionItem.className = 'solution-item';
                
                // Добавляем обработчик клика
                solutionItem.onclick = () => {
                    window.location.href = `student_solution_n_page.html?solution_id=${solution.id}`;
                };

                const solutionHeader = document.createElement('div');
                solutionHeader.className = 'solution-header';

                const solutionTitle = document.createElement('span');
                solutionTitle.className = 'solution-title';
                solutionTitle.textContent = `Решение от ${new Date(solution.created_at).toLocaleString()}`;

                const statusIndicator = document.createElement('div');
                statusIndicator.className = 'solution-status-indicator';
                
                // Определяем статус решения
                let statusClass = '';
                let statusText = '';
                switch (solution.state) {
                    case 1:
                        statusClass = 'status-pending';
                        statusText = 'В процессе';
                        break;
                    case 2:
                        statusClass = 'status-pending';
                        statusText = 'На проверке';
                        break;
                    case 3:
                        statusClass = 'status-success';
                        statusText = 'Решено';
                        break;
                    case 4:
                        statusClass = 'status-failure';
                        statusText = 'Неверно решено';
                        break;
                    default:
                        statusClass = 'status-pending';
                        statusText = 'Неизвестный статус';
                }

                const statusSpan = document.createElement('span');
                statusSpan.className = `solution-status ${statusClass}`;
                statusSpan.textContent = statusText;

                solutionHeader.appendChild(solutionTitle);
                solutionHeader.appendChild(statusSpan);
                solutionItem.appendChild(solutionHeader);

                // Добавляем превью решения
                const solutionPreview = document.createElement('div');
                solutionPreview.className = 'solution-preview';
                solutionPreview.textContent = solution.text;
                solutionItem.appendChild(solutionPreview);

                solutionsList.appendChild(solutionItem);
            });
        } catch (error) {
            console.error('Ошибка при загрузке решений:', error);
            showError('Не удалось загрузить историю решений');
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

    // Добавляем обработчик для кнопки отправки решения
    sendBtn.addEventListener('click', async () => {
        const answer = taskAnswer.value.trim();
        if (!answer) {
            showError('Пожалуйста, введите решение');
            return;
        }

        showLoading();
        try {
            const response = await fetch('/api/v0/solutions/student_solutions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    task_id: parseInt(taskId),
                    text: answer
                })
            });

            if (!response.ok) {
                throw new Error('Ошибка при отправке решения');
            }

            // Очищаем поле ответа
            taskAnswer.value = '';
            
            // Перезагружаем список решений
            await loadTaskSolutions();
            
            // Показываем сообщение об успехе
            const successMessage = document.createElement('div');
            successMessage.className = 'alert-success';
            successMessage.textContent = 'Решение успешно отправлено';
            solutionsList.insertBefore(successMessage, solutionsList.firstChild);
            
            // Удаляем сообщение через 3 секунды
            setTimeout(() => {
                successMessage.remove();
            }, 3000);

        } catch (error) {
            console.error('Ошибка при отправке решения:', error);
            showError('Не удалось отправить решение');
        } finally {
            hideLoading();
        }
    });

    // Загружаем данные задачи
    loadTaskData();
});
