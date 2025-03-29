// Функция для загрузки списка учеников с сервера
async function loadStudents() {
    try {
        // Временный список учеников для теста
        const response = await fetch('/api/students'); // Замените на ваш эндпоинт
        const students = await response.json();

        const container = document.getElementById('students-container'); // Контейнер на странице
        container.innerHTML = '<p class="text-center d-lg-flex justify-content-lg-center" style="font-size: 26px;margin: 0;padding: 0;height: 39px;width: 971px;">Список учеников</p>'; // Очищаем старый список

        students.forEach(student => {
            const studentHTML = `
                <div class="row" style="height: 42px;width: 971px;margin: 0;padding: 0;margin-top: 10px;">
                    <div class="col-lg-11 col-xl-12 col-xxl-12 d-lg-flex justify-content-lg-start align-items-lg-center" style="height: 42px;width: 971px;padding: 0;margin: 0;margin-top: 0px;">
                        <p style="width: 253px;margin: 0px;padding: 0px;height: 24px;">${student.name}</p>
                        <button class="btn my-btn" type="button" style="margin-left: 0px;width: 296.2734px;">Посмотреть выполненные задания</button>
                        <button class="btn my-btn" type="button" style="margin: 0px;margin-left: 11px;">Изменить логин и пароль</button>
                        <button class="btn my-btn" type="button" style="margin: 200px;margin-left: 9px;margin-bottom: 0px;margin-right: 0px;margin-top: 0px;">Удалить ученика</button>
                    </div>
                </div>`;

            container.insertAdjacentHTML('beforeend', studentHTML);
        });
    } catch (error) {
        console.error('Ошибка загрузки списка учеников:', error);
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', loadStudents);
