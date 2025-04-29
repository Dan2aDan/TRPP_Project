from tests import *

def test_add_task(database_all):
    # Создаем учителя и урок
    teacher = database_all.register_teacher("task_teacher", "pass", "Bio")
    lesson = database_all.add_lesson("Math", "Algebra", teacher.id)
    
    # Добавляем задачу
    task = database_all.add_task(lesson.id, "Solve equation", "1234")
    
    # Проверяем результат
    assert task.id is not None
    assert task.lesson_id == lesson.id
    assert task.description == "Solve equation"
    assert task.test == "1234"

def test_delete_task(database_all):
    teacher = database_all.register_teacher("del_teacher", "pass", "Bio")
    lesson = database_all.add_lesson("Physics", "Mechanics", teacher.id)
    task = database_all.add_task(lesson.id, "Calculate force", "1234")
    
    # Удаляем задачу
    assert database_all.delete_task(task.id)
    
    # Проверяем что задача удалена
    assert database_all.get_task_by_id(task.id) is None

def test_update_task(database_all):
    teacher = database_all.register_teacher("upd_teacher", "pass", "Bio")
    lesson = database_all.add_lesson("Chemistry", "Atoms", teacher.id)
    task = database_all.add_task(lesson.id, "Old description", "1234")
    
    # Обновляем задачу
    updated = database_all.update_task(task.id, "New description", "New test")
    
    # Проверяем изменения
    assert updated.description == "New description"
    assert updated.test == "New test"
    assert updated.id == task.id

def test_get_all_tasks(database_all):
    teacher = database_all.register_teacher("all_tasks_teacher", "pass", "Bio")
    lesson1 = database_all.add_lesson("History", "Ancient", teacher.id)
    lesson2 = database_all.add_lesson("Geography", "Countries", teacher.id)
    
    # Добавляем задачи
    task1 = database_all.add_task(lesson1.id, "Task 1", "1234")
    task2 = database_all.add_task(lesson2.id, "Task 2", "4321")
    
    # Получаем все задачи
    tasks = database_all.get_all_tasks()
    task_ids = {t.id for t in tasks}
    
    # Проверяем
    assert len(tasks) >= 2
    assert task1.id in task_ids
    assert task2.id in task_ids

def test_get_lesson_tasks(database_all):
    teacher = database_all.register_teacher("lesson_tasks_teacher", "pass", "Bio")
    lesson = database_all.add_lesson("Biology", "Cells", teacher.id)
    
    # Добавляем задачи
    task1 = database_all.add_task(lesson.id, "Task A", "1234")
    task2 = database_all.add_task(lesson.id, "Task B", "4321")
    
    # Получаем задачи урока
    tasks = database_all.get_lesson_tasks(lesson.id)
    
    # Проверяем
    assert len(tasks) == 2
    assert {t.id for t in tasks} == {task1.id, task2.id}

def test_get_task_by_id(database_all):
    teacher = database_all.register_teacher("task_by_id_teacher", "pass", "Bio")
    lesson = database_all.add_lesson("Literature", "Poems", teacher.id)
    task = database_all.add_task(lesson.id, "Find metaphor", "1234")
    
    # Получаем задачу по ID
    found = database_all.get_task_by_id(task.id)
    
    # Проверяем
    assert found.id == task.id
    assert found.description == task.description
    assert found.test == task.test

def test_get_student_tasks(database_all):
    teacher = database_all.register_teacher("student_tasks_teacher", "pass", "Bio")
    student = database_all.register_student("task_student", "pass", teacher.id)
    lesson = database_all.add_lesson("Programming", "Python", teacher.id)
    
    # Добавляем задачу и зависимость
    task = database_all.add_task(lesson.id, "Write function", "1234")
    database_all.add_lesson_dependencies(lesson.id, [student.id])
    
    # Получаем задачи студента
    tasks = database_all.get_student_tasks(student.id)
    
    # Проверяем
    assert len(tasks) == 1
    assert tasks[0].id == task.id

def test_get_teacher_tasks(database_all):
    teacher = database_all.register_teacher("teacher_tasks_teacher", "pass", "Bio")
    lesson = database_all.add_lesson("Art", "Painting", teacher.id)
    task = database_all.add_task(lesson.id, "Draw landscape", "1234")
    
    # Получаем задачи учителя
    tasks = database_all.get_teacher_tasks(teacher.id)
    
    # Проверяем
    assert len(tasks) >= 1
    assert task.id in [t.id for t in tasks]