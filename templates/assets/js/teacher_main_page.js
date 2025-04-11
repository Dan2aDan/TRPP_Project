// Функция для загрузки списка учеников с сервера
async function loadStudents() {
    try {
        // Загружаем список учеников с сервера
        const response = await fetch('/api/v0/students/students'); // Замените на ваш эндпоинт
        const students = await response.json();
        console.trace(students);


        const container = document.getElementById('students-container'); // Контейнер на странице
        container.innerHTML = '<p class="text-center d-lg-flex justify-content-lg-center" style="font-size: 26px;margin: 0;padding: 0;height: 39px;width: 971px;">Список учеников</p>'; // Очищаем старый список
        if (students.length > 0) {
        students.forEach(student => {
            const studentHTML = `
            <div class="row" style="height: 42px;width: 971px;margin: 0;padding: 0;margin-top: 10px;">
                <div class="col-lg-11 col-xl-12 col-xxl-12 d-lg-flex justify-content-lg-start align-items-lg-center" style="height: 42px;width: 971px;padding: 0;margin: 0;margin-top: 0px;">
                 <p style="width: 253px;margin: 0px;padding: 0px;height: 24px;">${student.name}</p>
                 <button class="btn link-dark my-btn view-tasks" data-id="${student.id}" style="width: 296.2734px;">Посмотреть выполненные задания</button>
                 <button class="btn my-btn edit-account" data-id="${student.id}" style="margin: 0px;margin-left: 11px;">Изменить логин и пароль</button>
                 <button class="btn my-btn delete-student" data-id="${student.id}" style="margin: 200px;margin-left: 9px;margin-bottom: 0px;margin-right: 0px;margin-top: 0px;">Удалить ученика</button>
                </div>
            </div>`;

            container.insertAdjacentHTML('beforeend', studentHTML);
        });
        }

        // Добавляем обработчики событий
        document.querySelectorAll('.view-tasks').forEach(button => {
            button.addEventListener('click', (event) => {
                const studentId = event.target.getAttribute('data-id');
                viewStudentTasks(studentId);
            });
        });

        document.querySelectorAll('.edit-account').forEach(button => {
            button.addEventListener('click', (event) => {
                const studentId = event.target.getAttribute('data-id');
                editStudentAccount(studentId);
            });
        });

        document.querySelectorAll('.delete-student').forEach(button => {
            button.addEventListener('click', (event) => {
                const studentId = event.target.getAttribute('data-id');
                deleteStudent(studentId);
            });
        });

    } catch (error) {
        console.error('Ошибка загрузки списка учеников:', error);
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', loadStudents);

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

// Функция для просмотра заданий ученика
function viewStudentTasks(studentId) {
    console.log('Просмотр заданий ученика с ID:', studentId);
    window.location.href = `/student/tasks?id=${studentId}`;
}

// Функция для изменения аккаунта ученика
function editStudentAccount(studentId) {
    console.log('Изменение аккаунта ученика с ID:', studentId);
    // Здесь можно открыть модальное окно для редактирования
}

// Функция для удаления ученика
async function deleteStudent(studentId) {
    if (confirm('Вы уверены, что хотите удалить этого ученика?')) {
        try {
            // Отправляем запрос на удаление ученика с сервера
            const response = await fetch(`/api/v0/students/${studentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Ученика удалили');
                loadStudents();  // Перезагружаем список учеников после удаления
            } else {
                alert('Ошибка при удалении ученика');
            }
        } catch (error) {
            console.error('Ошибка при удалении ученика:', error);
            alert('Произошла ошибка при удалении ученика');
        }
    }
}