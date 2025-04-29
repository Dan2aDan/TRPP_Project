
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

console.log('Загрузка задач ученика', studentId);

async function loadStudentTasks() {
    try {
        const response = await fetch(`/api/v0/tasks/student/${studentId}`, {
            method: 'GET'
        });
        const data = await response.json();

        const tasks = data.tasks || [];
        const container = document.getElementById('student_tsks').parentElement.parentElement;
        console.trace(data)
        // Удаляем старые элементы
        container.querySelectorAll('.row').forEach(row => row.remove());

        tasks.forEach(task => {
            const row = document.createElement('div');
            row.className = 'row';
            row.style = 'height:51px;width:586px;margin:0;padding:0;margin-top:10px;margin-left:77px;';

            row.innerHTML = `
                <div class="col-lg-11 col-xl-12 col-xxl-12 d-lg-flex justify-content-lg-start align-items-lg-center"
                     style="height:51px;width:586px;padding:0;margin:0;margin-left:0;margin-top:0px;">
                    <p style="margin-left:20px;margin-top:16px;">${task.id}</p>
                    <div class="card"
                         style="width:38px;height:38px;margin-left:92px;border-radius:32px;background:${getStatusColor(task.status)};"></div>
                    <button class="btn my-btn" type="button"
                            style="margin-left:75px;width:239.414px;height:41px;padding:0px;"
                            onclick="location.href='view_solution.html?taskId=${task.id}&studentId=${studentId}'">
                        Просмотреть решение
                    </button>
                </div>
            `;

            container.appendChild(row);
        });

        // Устанавливаем имя ученика (если есть)
        if (tasks.length > 0 && tasks[0].student_name) {
            document.getElementById('student_name').textContent = tasks[0].student_name;
        }

    } catch (error) {
        console.error('Ошибка при загрузке задач ученика:', error);
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'done':
            return 'green';
        case 'pending':
            return 'yellow';
        case 'missing':
            return 'red';
        default:
            return 'gray';
    }
}

loadStudentTasks();
