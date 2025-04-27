// Обработчики событий для кнопок навигации
document.getElementById('btn_lsns').addEventListener('click', () => {
    window.location.href = 'student_main_page.html';
});

document.getElementById('btn_tsks').addEventListener('click', () => {
    window.location.href = 'student_tasks_page.html';
});
// обработчик для кнопки урока
document.getElementById('stud_lsn_btn').addEventListener('click', () => {
    window.location.href = 'student_lesson_n_page.html';
});