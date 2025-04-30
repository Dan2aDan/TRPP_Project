document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы навигации
    const lessonsBtn = document.getElementById('btn_lsns');
    const tasksBtn = document.getElementById('btn_tsks');
    const lessonBtn = document.getElementById('stud_lsn_btn');

    // Проверяем существование элементов
    if (!lessonsBtn || !tasksBtn || !lessonBtn) {
        console.error('Required navigation buttons not found');
        return;
    }

    // Добавляем обработчики навигации
    lessonsBtn.addEventListener('click', () => {
        window.location.href = 'student_main_page.html';
    });

    tasksBtn.addEventListener('click', () => {
        window.location.href = 'student_tasks_page.html';
    });

    lessonBtn.addEventListener('click', () => {
        window.location.href = 'student_lesson_n_page.html';
    });

    // Проверяем авторизацию
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'login_page.html';
        return;
    }

    // Загружаем данные студента
    async function loadStudentData() {
        try {
            const response = await fetch('/api/v0/students/current', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Здесь можно добавить отображение данных студента
            console.log('Student data loaded:', data);
        } catch (error) {
            console.error('Error loading student data:', error);
        }
    }

    loadStudentData();
});