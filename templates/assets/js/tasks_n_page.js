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

    if (!saveBtn || !deleteBtn) {
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

    // Получаем кнопки для работы с файлами
    const taskActionButtons = document.querySelectorAll('.task-action-btn');
    const downloadFilesBtn = Array.from(taskActionButtons).find(btn => btn.textContent.includes('Скачать файлы'));
    const uploadFilesBtn = Array.from(taskActionButtons).find(btn => btn.textContent.includes('Загрузить файлы'));

    if (!downloadFilesBtn || !uploadFilesBtn) {
        console.error('Кнопки для работы с файлами не найдены');
        return;
    }

    // Обработчик скачивания файлов
    downloadFilesBtn.addEventListener('click', async () => {
        try {
            // Сначала получаем задачу
            const taskResponse = await fetch(`/api/v0/tasks/tasks/${state}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!taskResponse.ok) {
                throw new Error(`HTTP error! status: ${taskResponse.status}`);
            }

            const taskData = await taskResponse.json();
            const fileId = taskData.result.task_file;

            if (!fileId) {
                alert('У этой задачи нет прикрепленных файлов');
                return;
            }

            // Затем получаем файл по его ID
            const fileResponse = await fetch(`/api/v0/files/file/${fileId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!fileResponse.ok) {
                throw new Error(`HTTP error! status: ${fileResponse.status}`);
            }

            // Получаем имя файла из заголовка Content-Disposition или используем ID
            const contentDisposition = fileResponse.headers.get('Content-Disposition');
            let filename = `task_${fileId}`;
            
            if (contentDisposition) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    const originalName = matches[1].replace(/['"]/g, '');
                    const extension = originalName.split('.').pop();
                    filename = `task_${fileId}.${extension}`;
                }
            }

            const blob = await fileResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Ошибка при скачивании файлов:', error);
            alert('Ошибка при скачивании файлов');
        }
    });

    // Обработчик загрузки файлов
    uploadFilesBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.txt,.py,.java,.cpp,.cs,.js,.html,.css,.json,.xml,.md,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z';
        
        input.addEventListener('change', async (event) => {
            const files = event.target.files;
            if (files.length === 0) return;

            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Проверяем размер файла (максимум 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    alert(`Файл ${file.name} слишком большой. Максимальный размер - 10MB`);
                    continue;
                }
                formData.append('file', file);
                formData.append('bind_type', 'task');
                formData.append('bind_id', state);
            }

            if (formData.getAll('file').length === 0) {
                return;
            }

            try {
                const response = await fetch('/api/v0/files/file', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.code === 201) {
                    alert('Файлы успешно загружены');
                } else {
                    throw new Error(data.msg || 'Ошибка при загрузке файлов');
                }
            } catch (error) {
                console.error('Ошибка при загрузке файлов:', error);
                alert('Ошибка при загрузке файлов');
            }
        });

        input.click();
    });
});
