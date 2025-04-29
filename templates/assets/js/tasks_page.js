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

function viewTask(id_task) {

}


async function loadTasks() {
    let tasks = await (await fetch('/api/v0/tasks/tasks/', {'method': 'GET'})).json();
    let obj = document.getElementById('container-central');
    obj.innerHTML = '';
    console.trace(tasks)
    tasks.tasks.forEach(task => {
        const lessonHTML = `<div class="col-lg-11 col-xl-12 col-xxl-12 d-lg-flex justify-content-lg-start align-items-lg-center" style="height:51px;width:500px;padding:0;margin:0;margin-left:0;">
                        <button class="btn link-dark my-btn lesson-btn" type="button" style="width:350px;height:50px;">Задача 1</button>
                        <div class="card" style="width:38px;height:38px;margin-left:75px;border-radius:32px;background:rgb(255,0,0);"></div>
                    </div>`;

        obj.insertAdjacentHTML('beforeend', lessonHTML);
    })
    document.querySelectorAll('.lesson-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            console.trace('Клик по таске');
            const lessonId = event.currentTarget.getAttribute('data-id');
            viewTask(lessonId);
        });
    });
}

loadTasks();

document.getElementById('btn_new_tsk').addEventListener('click',() => {
    window.location.href = 'tasks_n_page.html';
});