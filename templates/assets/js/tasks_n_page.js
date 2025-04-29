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

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get('state'); // task_id или -1 для новой
    const lesson_id = params.get('lesson');

    const descriptionTextarea = document.querySelectorAll('textarea')[0];
    const codeTextarea = document.querySelectorAll('textarea')[2];
    const testTextarea = document.querySelectorAll('textarea')[1];


    function findButtonByText(text) {
        return Array.from(document.querySelectorAll('button'))
            .find(button => button.textContent.trim() === text);
    }

    const saveBtn = findButtonByText("Сохранить задачу");
    const deleteBtn = findButtonByText("Удалить задачу");
    const attachBtn = findButtonByText("Прикрепить задачу");


    if (state !== '-1') {
        // Загрузка задачи
        try {
            const response = await fetch(`/api/v0/tasks/tasks/${state}`, {method: 'GET'});
            const data = await response.json();
            const task = data.result;

            descriptionTextarea.value = task.description;
            codeTextarea.value = task.text;
            testTextarea.value = task.test;

        } catch (error) {
            console.error('Ошибка загрузки задачи:', error);
        }
    }

    // Сохранение задачи
    saveBtn.addEventListener('click', async () => {
        const description = descriptionTextarea.value;
        const text = codeTextarea.value;
        const test = 'test_data_here'; // вставь реальные данные
        // const lesson_id = 1; // временно захардкожено

        if (state === '-1') {
            // Создание
            const response = await fetch('/api/v0/tasks/tasks', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({description, text_program: text, test, lesson_id})
            });
            if (response.ok) {
                alert('Задача создана!');
                window.location.href = 'tasks_page.html';
            } else {
                alert('Ошибка создания задачи');
            }
        } else {
            // Обновление
            const response = await fetch(`/api/v0/tasks/tasks/${state}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({description})
            });
            if (response.ok) {
                alert('Задача обновлена!');
            } else {
                alert('Ошибка обновления');
            }
        }
    });

    // Удаление задачи
    deleteBtn.addEventListener('click', async () => {
        if (state === '-1') {
            alert('Невозможно удалить новую задачу');
            return;
        }
        const confirmDelete = confirm('Удалить задачу?');
        if (!confirmDelete) return;

        const response = await fetch(`/api/v0/tasks/tasks/${state}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('Задача удалена');
            window.location.href = 'tasks_page.html';
        } else {
            alert('Ошибка удаления');
        }
    });

    // Прикрепление задачи (если ты хочешь отдельный функционал — опиши подробнее)
    attachBtn.addEventListener('click', () => {
        alert('Прикрепление задачи — логика пока не реализована.');
    });
});
