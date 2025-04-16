from tests import *


def test_add_lesson(database_all):
    teacher = database_all.register_teacher("test_teacher", "pass")
    lesson = database_all.add_lesson("Math", "Algebra", teacher.id)
    
    # Проверяем создание урока
    assert lesson.title == "Math"
    assert lesson.content == "Algebra"
    assert lesson.teacher_id == teacher.id


def test_get_lesson_by_id(database_all):
    teacher = database_all.register_teacher("teacher1", "pass1")
    lesson = database_all.add_lesson("Math", "Algebra", teacher.id)
    
    result = database_all.get_lesson_by_id(lesson.id)
    assert result.id == lesson.id
    assert result.title == "Math"
    assert result.content == "Algebra"


def test_get_student_lessons(database_all):
    # 1. Регистрируем преподавателя и студента
    teacher = database_all.register_teacher("math_teacher", "pass123")
    student = database_all.register_student("math_student", "pass111", teacher.id)
    
    # 2. Создаем уроки
    lesson1 = database_all.add_lesson("Algebra", "Basics", teacher.id)
    lesson2 = database_all.add_lesson("Geometry", "Shapes", teacher.id)
    
    # 3. Получаем уроки студента
    student_lessons = database_all.get_student_lessons(student.id)
    
    # 4. Проверяем, что студент видит все уроки своего преподавателя
    assert len(student_lessons) == 2
    assert {lesson.id for lesson in student_lessons} == {lesson1.id, lesson2.id}
    
    # 5. Проверяем структуру возвращаемых данных
    for lesson in student_lessons:
        assert hasattr(lesson, 'id')
        assert hasattr(lesson, 'title')
        assert hasattr(lesson, 'content')
        assert hasattr(lesson, 'teacher_id')


def test_get_teacher_lessons(database_all):
    teacher = database_all.register_teacher("teacher3", "pass3")
    
    # Create lessons for the teacher
    lesson1 = database_all.add_lesson("Biology", "Cells", teacher.id)
    lesson2 = database_all.add_lesson("Geography", "Countries", teacher.id)
    
    # Get teacher's lessons
    lessons = database_all.get_teacher_lessons(teacher.id)
    assert len(lessons) == 2
    assert {l.id for l in lessons} == {lesson1.id, lesson2.id}


def test_update_lesson(database_all):
    teacher = database_all.register_teacher("teacher4", "pass4")
    lesson = database_all.add_lesson("History", "Ancient", teacher.id)
    
    # Update lesson
    updated = database_all.update_lesson(lesson.id, title="Modern History", content="20th Century")
    assert updated.title == "Modern History"
    assert updated.content == "20th Century"
    assert updated.teacher_id == teacher.id


def test_delete_lesson_with_dependencies(database_all):
    teacher = database_all.register_teacher("del_teacher", "pass")
    student = database_all.register_student("del_student", "pass", teacher.id)
    lesson = database_all.add_lesson("History", "Ancient", teacher.id)
    
    # Добавляем зависимость
    with db.create_session() as session:
        session.add(LessonsDepends(lesson_id=lesson.id, student_id=student.id))
        session.commit()
    
    # Удаляем урок
    assert database_all.delete_lesson(lesson.id)
    
    # Проверяем, что урок и зависимости удалены
    assert database_all.get_lesson_by_id(lesson.id) is None
    
    with db.create_session() as session:
        deps = session.execute(
            sqlalchemy.select(LessonsDepends)
            .where(LessonsDepends.lesson_id == lesson.id)
        ).scalars().all()
        assert len(deps) == 0