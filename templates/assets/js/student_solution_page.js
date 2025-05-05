document.addEventListener('DOMContentLoaded', () => {
    // Получаем ID решения из URL
    const solutionId = getSolutionIdFromUrl();
    
    // Загружаем данные решения
    loadSolutionData(solutionId);
    
    // Обработчики кнопок
    document.getElementById('back-btn').addEventListener('click', goBackToTask);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('btn_lsns').addEventListener('click', () => window.location.href = '/student/lessons');
    document.getElementById('btn_tsks').addEventListener('click', () => window.location.href = '/student/tasks');
});

// Функция для получения ID решения из URL
function getSolutionIdFromUrl() {
    const path = window.location.pathname;
    const match = path.match(/\/student\/solution\/(\d+)/);
    return match ? match[1] : null;
}

// Функция для загрузки данных решения
async function loadSolutionData(solutionId) {
    try {
        showLoading();
        const response = await fetch(`/student_solutions/${solutionId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при загрузке решения');
        }
        
        const solution = await response.json();
        displaySolution(solution);
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось загрузить решение');
    } finally {
        hideLoading();
    }
}

// Функция для отображения решения
function displaySolution(solution) {
    // Отображаем дату
    document.getElementById('solution-date').textContent = formatDate(solution.created_at);
    
    // Отображаем статус
    const statusElement = document.getElementById('solution-status');
    statusElement.textContent = getStatusText(solution.state);
    statusElement.className = `solution-status ${getStatusClass(solution.state)}`;
    
    // Отображаем код решения
    document.getElementById('solution-code').textContent = solution.text;
    
    // Отображаем результат проверки
    const resultElement = document.getElementById('solution-result');
    if (solution.state === 3) {
        resultElement.textContent = solution.result || 'Решение успешно';
        resultElement.className = 'solution-result status-success';
    } else if (solution.state === 4) {
        resultElement.textContent = solution.result || 'Ошибка при проверке';
        resultElement.className = 'solution-result status-failure';
    } else {
        resultElement.textContent = 'Решение в обработке';
        resultElement.className = 'solution-result status-pending';
    }
    
    // Отображаем ожидаемый результат
    document.getElementById('expected-result').textContent = solution.expected_result || 'Не указан';
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

// Функция для возврата к задаче
function goBackToTask() {
    const taskId = localStorage.getItem('currentTaskId');
    if (taskId) {
        window.location.href = `/student/task/${taskId}`;
    } else {
        window.location.href = '/student/tasks';
    }
}

// Функция для выхода
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

// Функции для отображения/скрытия индикатора загрузки
function showLoading() {
    document.getElementById('loading-indicator').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading-indicator').style.display = 'none';
}

// Функция для отображения ошибки
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
} 