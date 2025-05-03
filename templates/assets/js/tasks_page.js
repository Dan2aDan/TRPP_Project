document.addEventListener('DOMContentLoaded', () => {
    // Навигация
    document.getElementById('btn_students').addEventListener('click', () => {
        window.location.href = 'teacher_main_page.html';
    });
    document.getElementById('btn_lsns').addEventListener('click', () => {
        window.location.href = 'lessons_page.html';
    });
    document.getElementById('btn_tsks').addEventListener('click', () => {
        window.location.href = 'tasks_page.html';
    });

    // Кнопка выхода
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

    // Загрузка задач
    loadTasks();

    // Кнопка добавления задачи
    document.getElementById('btn_new_tsk').addEventListener('click',() => {
        viewTask(-1)
    });
});

function viewTask(id_task) {
    if  (id_task !== -1)
        window.location.href = `tasks_n_page.html?state=${id_task}`;
    else
        window.location.href = `tasks_n_page.html?state=new`;
}

async function loadTasks() {
    let tasks = await (await fetch('/api/v0/tasks/tasks/', {'method': 'GET'})).json();
    let container = document.getElementById('tasks-container');
    container.innerHTML = '';
    (tasks.tasks || []).forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        const title = document.createElement('div');
        title.className = 'task-title';
        title.textContent = task.title || `Задача ${task.id}`;
        const status = document.createElement('div');
        status.className = 'task-status-indicator';
        if (task.status === 'completed') status.classList.add('task-status-completed');
        else if (task.status === 'in_progress') status.classList.add('task-status-in-progress');
        else status.classList.add('task-status-not-started');
        card.appendChild(title);
        card.appendChild(status);
        card.addEventListener('click', () => viewTask(task.id));
        container.appendChild(card);
    });
}