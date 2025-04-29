// Обработчики событий для кнопок навигации
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
const lessonId = params.get('id');
console.log('ID урока из URL:', lessonId);


async function loadLesson() {
    try {
        // Загружаем список уроков с сервера
        const response = await fetch(`/api/v0/lessons/lesson/${lessonId}`, {method: 'GET'});
        const lesson = await response.json();
        console.trace(lesson.result, lesson.result.id, lesson.result.title, lesson.result.description, lesson.result.teacher, lesson.result.students, lesson.result.created_at);
        const container = document.getElementById('lesson-title');
        container.textContent = `Урок: ${lesson.result.title}`;

        const container2 = document.getElementById('lesson-description');
        container2.textContent = `${lesson.result.description}`;
    } catch (error) {
        console.error('Ошибка при загрузке уроков:', error);
    }
}

loadLesson()


document.getElementById('save-lesson').addEventListener('click', () => {
    fetch(`/api/v0/lessons/lesson/${lessonId}`,
        {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                file_id: -1,
                description: document.getElementById('lesson-description').value,
            }),
        }).then(r => {
        window.location.href = 'lessons_page.html';
    }).catch(error => {
        console.trace(error)
    });
});

document.getElementById('delete-lesson').addEventListener('click', () => {
        try {
            fetch(`/api/v0/lessons/lesson/${lessonId}`,
                {
                    method: 'DELETE',
                }).then(() => window.location.href = 'lessons_page.html');

        } catch
            (error) {
            console.trace(error)
        }
    }
)
;

async function loadTasks() {
    try {
        const response = await fetch(`/api/v0/tasks/tasks/${lessonId}/tasks`, {
            method: 'GET'
        });
        const data = await response.json();
        console.trace(data)
        const tasks = data.tasks || [];
        const container = document.querySelector('.row > .col > .card').parentElement;

        // Удаляем старые задачи (если есть)
        const existingCards = container.querySelectorAll('.card');
        existingCards.forEach(card => card.remove());

        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style = 'border-radius:28px;width:811px;margin-left:72px;height:auto;min-height:50px;margin-bottom:10px;';

            card.innerHTML = `
                <div class="card-body" style="border-radius:0px;">
                    <button class="btn my-btn show-btn" type="button" data-task-id="${task.id}" style="width:250px;margin-right:220px;">
                        ${task.id}
                    </button>
                    <button class="btn my-btn delete-task-btn" type="button" style="width:250px;" data-task-id="${task.id}">
                        Удалить задачу
                    </button>
                </div>
            `;

            container.appendChild(card);
        });
        document.querySelectorAll('.show-btn').forEach(btn => {
            btn.addEventListener('click', async () => {

                const taskId = btn.getAttribute('data-task-id');
                window.location.href = `/templates/tasks_n_page.html?state=${taskId}`
            });
        })
        // Навесим обработчики на кнопки удаления
        document.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const taskId = btn.getAttribute('data-task-id');
                try {
                    await fetch(`/api/v0/tasks/tasks/${taskId}`, {
                        method: 'DELETE',
                    });
                    await loadTasks(); // перезагрузим список задач
                } catch (error) {
                    console.error('Ошибка при удалении задачи:', error);
                }
            });
        });

    } catch (error) {
        console.trace(error)
    }
}

// Загружаем задачи при старте
loadTasks();

document.getElementById('create').addEventListener('click',() => {
    window.location.href = `tasks_n_page.html?state=-1&lesson=${lessonId}`;
})