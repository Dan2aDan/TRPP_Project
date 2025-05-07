document.addEventListener('DOMContentLoaded', async () => {
    // Навигация
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

    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        if (confirm('Вы уверены, что хотите выйти?')) {
            await fetch('/api/v0/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/login';
        }
    });

    // Открытие модального окна при нажатии на кнопку создания урока
    const newLessonBtn = document.getElementById('new_lesson_btn');
    if (newLessonBtn) {
        newLessonBtn.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('createLessonModal'));
            modal.show();
        });
    }

    // Элементы
    const lessonsContainer = document.getElementById('lessons-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');

    // Вспомогательные функции
    function showLoading() {
        if (loadingIndicator) loadingIndicator.style.display = '';
        if (errorMessage) errorMessage.style.display = 'none';
    }
    function hideLoading() {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
    function showError(msg) {
        if (errorMessage) {
            errorMessage.textContent = msg;
            errorMessage.style.display = '';
        }
        hideLoading();
    }
    function hideError() {
        if (errorMessage) errorMessage.style.display = 'none';
    }

    // Загрузка уроков
    async function loadLessons() {
        showLoading();
        try {
            const response = await fetch('/api/v0/lessons/lessons', { method: 'GET', credentials: 'include' });
            if (!response.ok) throw new Error('Ошибка загрузки');
            const data = await response.json();
            const lessons = data.lessons || [];
            lessonsContainer.innerHTML = '';
            if (lessons.length === 0) {
                lessonsContainer.innerHTML = '<p class="text-center text-muted">Нет доступных уроков</p>';
                hideLoading();
                return;
            }
            lessons.forEach(lesson => {
                const card = document.createElement('div');
                card.className = 'lesson-card mb-3';

                const title = document.createElement('h4');
                title.className = 'lesson-title mb-2';
                title.textContent = lesson.title;
                card.appendChild(title);

                const description = document.createElement('p');
                description.className = 'lesson-description';
                description.textContent = lesson.description || '';
                card.appendChild(description);

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'lesson-actions mt-3';

                const editButton = document.createElement('button');
                editButton.className = 'btn action-btn edit-lesson';
                editButton.dataset.id = lesson.id;
                editButton.dataset.action = 'edit';

                const icon = document.createElement('i');
                icon.className = 'fas fa-edit me-2';
                editButton.appendChild(icon);
                editButton.appendChild(document.createTextNode('Редактировать'));

                editButton.addEventListener('click', () => {
                    window.location.href = `lesson_n_page.html?id=${lesson.id}`;
                });

                actionsDiv.appendChild(editButton);
                card.appendChild(actionsDiv);
                lessonsContainer.appendChild(card);
            });
            hideLoading();
        } catch (e) {
            showError('Ошибка при загрузке уроков');
        }
    }

    // Инициализация
    hideError();
    await loadLessons();

    // Обработчик создания урока
    const saveLessonBtn = document.getElementById('saveLessonBtn');
    if (saveLessonBtn) {
        saveLessonBtn.addEventListener('click', async () => {
            const title = document.getElementById('lessonTitle').value.trim();
            const content = document.getElementById('lessonContent').value.trim();

            if (!title || !content) {
                alert('Пожалуйста, заполните все поля');
                return;
            }

            try {
                const response = await fetch('/api/v0/lessons/lessons', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: title,
                        description: content
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Закрываем модальное окно
                const modal = bootstrap.Modal.getInstance(document.getElementById('createLessonModal'));
                modal.hide();

                // Очищаем форму
                document.getElementById('createLessonForm').reset();

                // Обновляем список уроков
                await loadLessons();

                alert('Урок успешно создан!');
            } catch (error) {
                console.error('Ошибка при создании урока:', error);
                alert('Произошла ошибка при создании урока');
            }
        });
    }
});

// Функция удаления урока
async function deleteLesson(lessonId) {
    if (!confirm('Вы уверены, что хотите удалить этот урок?')) {
        return;
    }

    try {
        const response = await fetch(`/api/v0/lessons/lessons/${lessonId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await loadLessons();
        alert('Урок успешно удален');
    } catch (error) {
        console.error('Ошибка при удалении урока:', error);
        alert('Произошла ошибка при удалении урока');
    }
}