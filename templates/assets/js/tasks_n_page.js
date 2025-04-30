// Инициализация страницы
document.addEventListener('DOMContentLoaded', async () => {
    // Добавляем обработчики навигации
    const studentsBtn = document.getElementById('btn_students');
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');

    if (studentsBtn) {
        studentsBtn.addEventListener('click', () => {
            window.location.href = 'teacher_main_page.html';
        });
    }

    if (lessonsBtn) {
        lessonsBtn.addEventListener('click', () => {
            window.location.href = 'lessons_page.html';
        });
    }

    if (tasksBtn) {
        tasksBtn.addEventListener('click', () => {
            window.location.href = 'tasks_page.html';
        });
    }

    const params = new URLSearchParams(window.location.search);
    const state = params.get('state'); // task_id или -1 для новой
    const lesson_id = params.get('lesson_id');


    const descriptionTextarea = document.querySelectorAll('textarea')[0];
    const codeTextarea = document.querySelectorAll('textarea')[2];
    const testTextarea = document.querySelectorAll('textarea')[1];

    if (!descriptionTextarea || !codeTextarea || !testTextarea) {
        console.error('Required textareas not found');
        alert('Ошибка: Не найдены необходимые поля ввода');
        return;
    }

    function findButtonByText(text) {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(button => button.textContent.trim() === text);
    }

    const saveBtn = findButtonByText("Сохранить задачу");
    const deleteBtn = findButtonByText("Удалить задачу");
    const attachBtn = findButtonByText("Прикрепить задачу");

    if (!saveBtn || !deleteBtn || !attachBtn) {
        console.error('Required buttons not found');
        alert('Ошибка: Не найдены необходимые кнопки');
        return;
    }

    if (state !== '-1') {
        // Загрузка задачи
        try {
            const response = await fetch(`/api/v0/tasks/tasks/${state}`, {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const task = data.result;

            descriptionTextarea.value = task.description;
            codeTextarea.value = task.text;
            testTextarea.value = task.test;
        } catch (error) {
            console.error('Ошибка загрузки задачи:', error);
            alert('Произошла ошибка при загрузке задачи');
        }
    }

    // Сохранение задачи
    saveBtn.addEventListener('click', async () => {
        const description = descriptionTextarea.value.trim();
        const text = codeTextarea.value.trim();
        const test = testTextarea.value.trim();

        if (!description || !text || !test) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        try {
            if (state === '-1') {
                // Создание новой задачи
                const response = await fetch('/api/v0/tasks/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'description': description,
                        'text_program': text,
                        'test': test,
                        'lesson_id': parseInt(lesson_id)
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                alert('Задача успешно создана!');
                window.location.href = 'tasks_page.html';
            } else {
                // Обновление существующей задачи
                const response = await fetch(`/api/v0/tasks/tasks/${state}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'description': description,
                        'text_program': text,
                        'test': test,
                        'task_id': state,
                        // lesson_id: parseInt(lesson_id)
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                alert('Задача успешно обновлена!');
            }
        } catch (error) {
            console.error('Ошибка при сохранении задачи:', error);
            alert('Произошла ошибка при сохранении задачи');
        }
    });

    // Удаление задачи
    deleteBtn.addEventListener('click', async () => {
        if (state === '-1') {
            alert('Невозможно удалить новую задачу');
            return;
        }

        if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
            return;
        }

        try {
            const response = await fetch(`/api/v0/tasks/tasks/${state}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert('Задача успешно удалена');
            window.location.href = 'tasks_page.html';
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
            alert('Произошла ошибка при удалении задачи');
        }
    });

    // Прикрепление задачи
    attachBtn.addEventListener('click', () => {
        alert('Функционал прикрепления задачи находится в разработке');
    });
});
