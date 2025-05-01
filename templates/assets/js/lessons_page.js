document.addEventListener('DOMContentLoaded', () => {
    // Навигация
    document.getElementById('btn_students')?.addEventListener('click', () => {
        window.location.href = 'teacher_main_page.html';
    });
    document.getElementById('btn_lsns')?.addEventListener('click', () => {
        window.location.href = 'lessons_page.html';
    });
    document.getElementById('btn_tsks')?.addEventListener('click', () => {
        window.location.href = 'tasks_page.html';
    });
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        if (confirm('Вы уверены, что хотите выйти?')) {
            await fetch('/api/v0/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/login';
        }
    });

    // Элементы
    const lessonsContainer = document.getElementById('lessons-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const addLessonModal = document.getElementById('addLessonModal');
    const addLessonForm = document.getElementById('addLessonForm');
    const addLessonBtn = document.getElementById('addLessonBtn');
    let modalInstance = null;
    if (addLessonModal && window.bootstrap) {
        modalInstance = bootstrap.Modal.getOrCreateInstance(addLessonModal);
    }

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

    // Добавление урока
    if (addLessonForm && addLessonBtn) {
        addLessonBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const title = addLessonForm.querySelector('#lessonTitle').value.trim();
            const description = addLessonForm.querySelector('#lessonDescription').value.trim();
            const date = addLessonForm.querySelector('#lessonDate').value;
            // Файлы не реализованы
            if (!title || !description || !date) {
                showError('Пожалуйста, заполните все поля');
                return;
            }
            showLoading();
            try {
                const response = await fetch('/api/v0/lessons/lessons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ title, description, date })
                });
                if (!response.ok) throw new Error('Ошибка добавления');
                if (modalInstance) modalInstance.hide();
                addLessonForm.reset();
                await loadLessons();
            } catch (e) {
                showError('Ошибка при добавлении урока');
            }
        });
    }

    // Инициализация
    hideError();
    loadLessons();
});