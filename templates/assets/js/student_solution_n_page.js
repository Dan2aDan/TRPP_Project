document.addEventListener('DOMContentLoaded', async () => {
    // Получаем элементы
    const solutionTitle = document.getElementById('solution-title');
    const solutionStatus = document.getElementById('solution-status');
    const solutionProgram = document.getElementById('solution-program');
    const solutionResult = document.getElementById('solution-result');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const backBtn = document.getElementById('back-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');

    // Получаем ID решения из URL
    const params = new URLSearchParams(window.location.search);
    const solutionId = params.get('solution_id');

    if (!solutionId) {
        showError('ID решения не указан');
        return;
    }

    // Функция для отображения сообщения об ошибке
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        loadingIndicator.style.display = 'none';
    }

    // Функция для отображения индикатора загрузки
    function showLoading() {
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
    }

    // Функция для скрытия индикатора загрузки
    function hideLoading() {
        loadingIndicator.style.display = 'none';
    }

    // Загружаем данные решения
    async function loadSolutionData() {
        showLoading();
        try {
            const response = await fetch(`/api/v0/solutions/student_solutions/${solutionId}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Ошибка при загрузке решения');
            }

            const data = await response.json();
            const solution = data.result;

            // Обновляем заголовок
            solutionTitle.textContent = `Решение от ${new Date(solution.created_at).toLocaleString()}`;

            // Устанавливаем статус
            let statusClass = '';
            let statusText = '';
            let statusIcon = '';
            switch (solution.state) {
                case 1:
                    statusClass = 'status-pending';
                    statusText = 'В процессе';
                    statusIcon = '<i class="fas fa-clock"></i>';
                    break;
                case 2:
                    statusClass = 'status-pending';
                    statusText = 'На проверке';
                    statusIcon = '<i class="fas fa-hourglass-half"></i>';
                    break;
                case 3:
                    statusClass = 'status-success';
                    statusText = 'Решено';
                    statusIcon = '<i class="fas fa-check-circle"></i>';
                    break;
                case 4:
                    statusClass = 'status-failure';
                    statusText = 'Неверно решено';
                    statusIcon = '<i class="fas fa-times-circle"></i>';
                    break;
                default:
                    statusClass = 'status-pending';
                    statusText = 'Неизвестный статус';
                    statusIcon = '<i class="fas fa-question-circle"></i>';
            }
            solutionStatus.className = `solution-status ${statusClass}`;
            solutionStatus.innerHTML = `${statusIcon} ${statusText}`;

            // Заполняем поля
            solutionProgram.value = solution.text;
            solutionResult.value = solution.result || 'Результат тестирования отсутствует';

        } catch (error) {
            console.error('Ошибка:', error);
            showError('Не удалось загрузить решение');
        } finally {
            hideLoading();
        }
    }

    // Обработчики кнопок
    backBtn.addEventListener('click', () => {
        window.history.back();
    });

    logoutBtn.addEventListener('click', async () => {
        if (confirm('Вы действительно хотите выйти?')) {
            try {
                await fetch('/api/v0/auth/logout', { method: 'POST', credentials: 'include' });
            } catch (e) {}
            window.location.href = 'login.html';
        }
    });

    lessonsBtn.addEventListener('click', () => {
        window.location.href = 'student_main_page.html';
    });

    tasksBtn.addEventListener('click', () => {
        window.location.href = 'student_tasks_page.html';
    });

    // Загружаем данные
    loadSolutionData();
}); 