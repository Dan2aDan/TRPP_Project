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

const params = new URLSearchParams(window.location.search);
const lessonId = params.get('id');
console.log('ID урока из URL:', lessonId);


async function loadLesson() {
    try {
        // Загружаем список уроков с сервера
        const response = await fetch(`/api/v0/lessons/lesson/${lessonId}`, {method: 'GET'});
        const lesson = await response.json();
        console.trace(lesson.result, lesson.result.id, lesson.result.title, lesson.result.description, lesson.result.teacher, lesson.result.students, lesson.result.created_at);
        const container = document.getElementById('lesson-title');
        container.textContent = `Урок: ${lesson.result.title}`;

        const container2 = document.getElementById('lesson-description');
        container2.textContent = `${lesson.result.description}`;
    } catch (error) {
        console.error('Ошибка при загрузке уроков:', error);
    }
}

loadLesson()


document.getElementById('save-lesson').addEventListener('click', () => {
    fetch(`/api/v0/lessons/lesson/${lessonId}`,
        {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                file_id: -1,
                description: document.getElementById('lesson-description').value,
            }),
        }).then(r => {
        window.location.href = 'lessons_page.html';
    }).catch(error => {
        console.trace(error)
    });
});

document.getElementById('delete-lesson').addEventListener('click', () => {
        try {
            fetch(`/api/v0/lessons/lesson/${lessonId}`,
                {
                    method: 'DELETE',
                }).then(()=> window.location.href = 'lessons_page.html');

        } catch
            (error) {
            console.trace(error)
        }
    }
)
;