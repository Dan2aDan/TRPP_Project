// Функция для загрузки списка учеников с сервера
async function loadStudents() {
    try {
        const response = await fetch('/api/v0/students/students');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const students = await response.json();
        const container = document.getElementById('students-container');
        
        if (!container) {
            console.error('Container element not found');
            return;
        }

        container.innerHTML = '';

        if (students.students && students.students.length > 0) {
            students.students.forEach(student => {
                const row = document.createElement('div');
                row.className = 'row';
                row.style.cssText = 'margin: 10px 0; padding: 0;';

                row.innerHTML = `
                    <div class="col d-lg-flex justify-content-start align-items-center" style="padding: 0;">
                        <p style="width: 250px; margin: 0;">${student.login}</p>
                        <button class="btn link-dark my-btn add-lesson" type="button" style="width:296px;">Открыть урок</button>
                        <button class="btn link-dark my-btn view-tasks" data-id="${student.id}" style="margin-left: 10px;">Посмотреть выполненные задания</button>
                        <button class="btn my-btn edit-account" data-id="${student.id}" style="margin-left: 10px;">Изменить логин и пароль</button>
                        <button class="btn my-btn delete-student" data-id="${student.id}" style="margin-left: 10px;">Удалить ученика</button>
                    </div>
                `;

                // Добавление обработчиков
                const addLessonBtn = row.querySelector('.add-lesson');
                const viewTasksBtn = row.querySelector('.view-tasks');
                const editAccountBtn = row.querySelector('.edit-account');
                const deleteStudentBtn = row.querySelector('.delete-student');

                if (addLessonBtn) addLessonBtn.addEventListener('click', () => addLessonp(student.id));
                if (viewTasksBtn) viewTasksBtn.addEventListener('click', () => viewStudentTasks(student.id));
                if (editAccountBtn) editAccountBtn.addEventListener('click', () => editStudentAccount(student.id));
                if (deleteStudentBtn) deleteStudentBtn.addEventListener('click', () => deleteStudent(student.id));

                container.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки списка учеников:', error);
        alert('Произошла ошибка при загрузке списка учеников');
    }
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();

    // Добавляем обработчики навигации
    const studentsBtn = document.getElementById('btn_students');
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');

    if (studentsBtn) studentsBtn.addEventListener('click', () => {
        window.location.href = 'teacher_main_page.html';
    });

    if (lessonsBtn) lessonsBtn.addEventListener('click', () => {
        window.location.href = 'lessons_page.html';
    });

    if (tasksBtn) tasksBtn.addEventListener('click', () => {
        window.location.href = 'tasks_page.html';
    });
});

function addLessonp(studentId) {
    console.log('Просмотр заданий ученика с ID:', studentId);
    window.location.href = `lessons_page(frm_tsk_n).html?id=${studentId}`;
}
// Функция для просмотра заданий ученика
function viewStudentTasks(studentId) {
    console.log('Просмотр заданий ученика с ID:', studentId);
    window.location.href = `completed_tasks.html?id=${studentId}`;
}

// Функция для изменения аккаунта ученика
async function editStudentAccount(studentId) {
    try {
        const response = await fetch(`/api/v0/students/${studentId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const student = await response.json();

        const studentIdInput = document.getElementById('studentId');
        const studentLoginInput = document.getElementById('studentLogin');
        const studentPasswordInput = document.getElementById('studentPassword');

        if (!studentIdInput || !studentLoginInput || !studentPasswordInput) {
            throw new Error('Required form elements not found');
        }

        studentIdInput.value = studentId;
        studentLoginInput.value = student.result.login;
        studentPasswordInput.value = student.result.password;

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
    if (!confirm('Вы уверены, что хотите удалить этого ученика?')) {
        return;
    }

    try {
        const response = await fetch(`/api/v0/students/${studentId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('Ученик успешно удален');
        loadStudents();
    } catch (error) {
        console.error('Ошибка при удалении ученика:', error);
        alert('Произошла ошибка при удалении ученика');
    }
}