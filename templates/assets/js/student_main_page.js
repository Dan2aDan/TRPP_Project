document.addEventListener('DOMContentLoaded', async () => {
    // Получаем элементы навигации и контейнеры
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    const lessonsContainer = document.getElementById('lessons-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');

    // Проверяем существование элементов
    if (!lessonsBtn || !tasksBtn || !lessonsContainer || !loadingIndicator || !errorMessage) {
        console.error('Required elements not found');
        return;
    }

    // Функция для отображения сообщения об ошибке
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        loadingIndicator.style.display = 'none';
    }

    // Функция для скрытия сообщения об ошибке
    function hideError() {
        errorMessage.style.display = 'none';
    }

    // Функция для отображения индикатора загрузки
    function showLoading() {
        loadingIndicator.style.display = 'block';
        hideError();
    }

    // Функция для скрытия индикатора загрузки
    function hideLoading() {
        loadingIndicator.style.display = 'none';
    }

    // Загружаем данные студента и его уроки
    async function loadStudentData() {
        showLoading();
        try {
            // Получаем информацию о текущем пользователе
            const currentUserResponse = await fetch('/api/v0/auth/current', {
                credentials: 'include'
            });

            if (!currentUserResponse.ok) {
                throw new Error(`HTTP error! status: ${currentUserResponse.status}`);
            }

            const currentUserData = await currentUserResponse.json();
            
            if (!currentUserData.result || !currentUserData.result.id) {
                throw new Error('Не удалось получить информацию о пользователе');
            }

            const studentId = currentUserData.result.id;

            // Получаем уроки студента
            const lessonsResponse = await fetch(`/api/v0/lessons/student/${studentId}`, {
                credentials: 'include'
            });

            if (!lessonsResponse.ok) {
                throw new Error(`HTTP error! status: ${lessonsResponse.status}`);
            }

            const lessonsData = await lessonsResponse.json();
            const lessons = lessonsData.result || [];

            hideLoading();
            lessonsContainer.innerHTML = '';

            if (lessons.length === 0) {
                const noLessonsDiv = document.createElement('div');
                noLessonsDiv.className = 'col-12';
                noLessonsDiv.innerHTML = '<p class="text-center">У вас пока нет доступных уроков</p>';
                lessonsContainer.appendChild(noLessonsDiv);
                return;
            }

            // Создаем элементы для каждого урока
            lessons.forEach(lesson => {
                const lessonDiv = document.createElement('div');
                lessonDiv.className = 'col-12';
                lessonDiv.innerHTML = `
                    <div class="col-lg-11 col-xl-12 col-xxl-12 d-lg-flex justify-content-lg-start align-items-lg-center"
                         style="height: 51px;width: 500px;padding: 0;margin: 0;margin-left: 0;margin-bottom: 20px;">
                        <button class="btn link-dark my-btn lesson-btn" 
                                data-lesson-id="${lesson.id}" 
                                style="width: 350px;height: 50px;">
                            ${lesson.title || `Урок ${lesson.id}`}
                        </button>
                        <div class="card status-indicator" 
                             style="width:38px;height:38px;margin-left:75px;border-radius:32px;background: ${getStatusColor(lesson.status)};">
                        </div>
                    </div>
                `;

                // Добавляем обработчик клика на кнопку урока
                const lessonButton = lessonDiv.querySelector('.lesson-btn');
                lessonButton.addEventListener('click', () => {
                    window.location.href = `student_lesson_n_page.html?id=${lesson.id}`;
                });

                lessonsContainer.appendChild(lessonDiv);
            });
        } catch (error) {
            console.error('Error loading student data:', error);
            showError('Ошибка при загрузке данных');
        }
    }

    // Функция для получения цвета статуса
    function getStatusColor(status) {
        switch (status) {
            case 'completed':
                return 'rgb(0, 255, 0)'; // Зеленый
            case 'in_progress':
                return 'rgb(255, 255, 0)'; // Желтый
            default:
                return 'rgb(255, 0, 0)'; // Красный
        }
    }

    // Добавляем обработчики навигации
    lessonsBtn.addEventListener('click', () => {
        window.location.href = 'student_main_page.html';
    });

    tasksBtn.addEventListener('click', () => {
        window.location.href = 'student_tasks_page.html';
    });

    // Загружаем данные при загрузке страницы
    loadStudentData();
});