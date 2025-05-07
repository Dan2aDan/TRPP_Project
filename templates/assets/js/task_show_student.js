// Перенаправление на другие страницы
document.getElementById('btn_students').addEventListener('click', () => {
    window.location.href = 'teacher_main_page.html';
});

document.getElementById('btn_lsns').addEventListener('click', () => {
    window.location.href = 'lessons_page.html';
});

document.getElementById('btn_tsks').addEventListener('click', () => {
    window.location.href = 'tasks_page.html';
});


const params = new URLSearchParams(window.location.search);
const studentId = params.get('id');
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {

        try {
            await fetch('/api/v0/auth/logout', {method: 'POST', credentials: 'include'});
        } catch (e) {
        }
        window.location.href = 'login.html';

    });
}
console.log('Загрузка задач и статусов ученика', studentId);

async function loadStudentTasksWithStatus() {
    try {
        // Получаем все задачи студента
        const response = await fetch(`/api/v0/tasks/student/${studentId}`, {
            method: 'GET'
        });
        const data = await response.json();
        const tasks = data.tasks || [];
        const container = document.querySelector('.main-card');
        container.querySelectorAll('.solution-row').forEach(row => row.remove());

        for (const task of tasks) {
            // Получаем статус задачи через отдельный endpoint
            let statusClass = 'failed';
            let statusText = '';
            try {
                const statusResp = await fetch(`/api/v0/lessons/task/${task.id}/status`);
                const statusData = await statusResp.json();
                const status = statusData.status || 'not_started';
                statusClass = getStatusClassByText(status);
                statusText = getStatusText(status);
            } catch (e) {
                statusText = 'Ошибка';
            }

            const row = document.createElement('div');
            row.className = 'solution-row';
            row.innerHTML = `
                <span class="solution-id">${task.id}</span>
                <span class="solution-task">${task.description || ''}</span>
                <span class="solution-status ${statusClass}" title="${statusText}"></span>
                <button class="view-solution-btn" onclick="location.href='view_solution.html?taskId=${task.id}&studentId=${studentId}'">
                    <i class="fas fa-eye me-2"></i>Просмотреть решение
                </button>
            `;
            container.appendChild(row);
        }

        // Имя ученика (если есть)
        // Можно получить отдельным запросом, если нужно

    } catch (error) {
        console.error('Ошибка при загрузке задач и статусов ученика:', error);
    }
}

function getStatusClassByText(status) {
    switch (status) {
        case 'completed':
            return 'completed';
        case 'in-progress':
            return 'in-progress';
        case 'not-started':
        default:
            return 'failed';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'completed':
            return 'Выполнено';
        case 'in_progress':
            return 'В процессе';
        case 'not_started':
            return 'Не начато';
        default:
            return status;
    }
}

loadStudentTasksWithStatus();
