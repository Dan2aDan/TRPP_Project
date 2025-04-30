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
                const studentCard = document.createElement('div');
                studentCard.className = 'student-card';
                
                const studentInfo = document.createElement('div');
                studentInfo.className = 'student-info';
                studentInfo.textContent = student.login;
                
                const actionsContainer = document.createElement('div');
                actionsContainer.className = 'student-actions';
                
                const addLessonBtn = createActionButton('Открыть урок', 'add-lesson', 'fa-book');
                const viewTasksBtn = createActionButton('Задания', 'view-tasks', 'fa-tasks', student.id);
                const editAccountBtn = createActionButton('Изменить', 'edit-account', 'fa-edit', student.id);
                const deleteStudentBtn = createActionButton('Удалить', 'delete-student', 'fa-trash', student.id);
                
                actionsContainer.append(addLessonBtn, viewTasksBtn, editAccountBtn, deleteStudentBtn);
                studentCard.append(studentInfo, actionsContainer);
                container.appendChild(studentCard);
                
                // Добавление обработчиков
                addLessonBtn.addEventListener('click', () => addLessonp(student.id));
                viewTasksBtn.addEventListener('click', () => viewStudentTasks(student.id));
                editAccountBtn.addEventListener('click', () => editStudentAccount(student.id));
                deleteStudentBtn.addEventListener('click', () => deleteStudent(student.id));
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки списка учеников:', error);
        showError('Произошла ошибка при загрузке списка учеников');
    }
}

// Вспомогательная функция для создания кнопок действий
function createActionButton(text, className, iconClass, dataId = null) {
    const button = document.createElement('button');
    button.className = `btn action-btn ${className}`;
    button.innerHTML = `<i class="fas ${iconClass} me-2"></i>${text}`;
    if (dataId) {
        button.dataset.id = dataId;
    }
    return button;
}

// Функция для отображения ошибки
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger error-message';
    errorDiv.textContent = message;
    document.getElementById('students-container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
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