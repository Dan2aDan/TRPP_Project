// Функция для загрузки списка учеников с сервера
async function loadStudents() {
    try {
        // Загружаем список учеников с сервера
        const response = await fetch('/api/v0/students/students'); // Замените на ваш эндпоинт
        const students = await response.json();
        console.trace(students);
        const container = document.getElementById('students-container'); // Контейнер на странице
        // const lessonsList = container.querySelector('.row'); // Секция для отображения уроков
        container.innerHTML = ''; // Очищаем старые уроки

        if (students.students.length > 0) {

            students.students.forEach(student => {
                const row = document.createElement('div');
                row.className = 'row';
                row.style.cssText = 'margin: 10px 0; padding: 0;';

                row.innerHTML = `
        <div class="col d-lg-flex justify-content-start align-items-center"
             style="padding: 0;">
            <p style="width: 250px; margin: 0;">${student.login}</p>
            <button class="btn link-dark my-btn view-tasks" data-id="${student.id}" style="margin-left: 10px;">Посмотреть выполненные задания</button>
            <button class="btn my-btn edit-account" data-id="${student.id}" style="margin-left: 10px;">Изменить логин и пароль</button>
            <button class="btn my-btn delete-student" data-id="${student.id}" style="margin-left: 10px;">Удалить ученика</button>
        </div>
    `;

                // Добавление обработчиков
                row.querySelector('.view-tasks').addEventListener('click', () => viewStudentTasks(student.id));
                row.querySelector('.edit-account').addEventListener('click', () => editStudentAccount(student.id));
                row.querySelector('.delete-student').addEventListener('click', () => deleteStudent(student.id));

                container.appendChild(row);
            });


        }

    } catch
        (error) {
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
async function editStudentAccount(studentId) {
    try {
        // Получаем текущие данные ученика
        const response = await fetch(`/api/v0/students/${studentId}`);
        const student = await response.json();
        console.trace(student)
        // Заполняем поля модального окна
        document.getElementById('studentId').value = studentId;
        document.getElementById('studentLogin').value = student.result.login;
        document.getElementById('studentPassword').value = student.result.password; // Пароль не отображаем

        // Показываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById('editStudentModal'));
        modal.show();
    } catch (error) {
        console.error('Ошибка при получении данных ученика:', error);
        alert('Ошибка при получении данных ученика');
    }
}

// Обработчик сохранения изменений
document.getElementById('saveChangesBtn').addEventListener('click', async () => {
    const studentId = document.getElementById('studentId').value;
    const newLogin = document.getElementById('studentLogin').value;
    const newPassword = document.getElementById('studentPassword').value;

    try {
        const response = await fetch(`/api/v0/students/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                login: newLogin,
                password: newPassword
            })
        });

        if (response.ok) {
            alert('Данные ученика успешно обновлены');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editStudentModal'));
            modal.hide();
            loadStudents(); // Перезагружаем список учеников
        } else {
            alert('Ошибка при обновлении данных ученика');
        }
    } catch (error) {
        console.error('Ошибка при обновлении данных ученика:', error);
        alert('Произошла ошибка при обновлении данных');
    }
});

// Обработчик добавления нового ученика
document.getElementById('addStudentBtn').addEventListener('click', async () => {
    const login = document.getElementById('newStudentLogin').value;
    const password = document.getElementById('newStudentPassword').value;

    try {
        const response = await fetch('/api/v0/students/add_student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                login: login,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Ученик успешно добавлен');
            const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
            modal.hide();
            // Очищаем поля формы
            document.getElementById('newStudentLogin').value = '';
            document.getElementById('newStudentPassword').value = '';
            // Обновляем список учеников
            loadStudents();
        } else {
            alert(data.msg || 'Ошибка при добавлении ученика');
        }
    } catch (error) {
        console.error('Ошибка при добавлении ученика:', error);
        alert('Произошла ошибка при добавлении ученика');
    }
});

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