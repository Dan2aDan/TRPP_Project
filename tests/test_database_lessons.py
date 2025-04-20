from tests import *


def test_add_lesson(database_all):
    teacher = database_all.register_teacher("test_teacher", "pass", "Коваленко Кирилл")
    lesson = database_all.add_lesson("Math", "Algebra", teacher.id)
    
    # Проверяем создание урока
    assert lesson.title == "Math"
    assert lesson.content == "Algebra"
    assert lesson.teacher_id == teacher.id


def test_add_lesson_dependencies(database_all):
    teacher = database_all.register_teacher("dep_teacher", "pass", "Коваленко Кирилл")
    student1 = database_all.register_student("student1", "pass", teacher.id)
    student2 = database_all.register_student("student2", "pass", teacher.id)
    
    lesson = database_all.add_lesson("Physics", "Mechanics", teacher.id)
    
    # Добавляем зависимости отдельным вызовом
    database_all.add_lesson_dependencies(lesson.id, [student1.id, student2.id])
    
    # Проверяем, что зависимости созданы
    with db.create_session() as session:
        deps = session.execute(
            sqlalchemy.select(LessonsDepends)
            .where(LessonsDepends.lesson_id == lesson.id)
        ).scalars().all()
        
        assert len(deps) == 2
        assert {dep.student_id for dep in deps} == {student1.id, student2.id}


def test_get_student_lessons(database_all):
    teacher1 = database_all.register_teacher("teacher1", "pass1", "Коваленко Кирилл")
    teacher2 = database_all.register_teacher("teacher2", "pass2", "Абубакаров Турпал")
    student = database_all.register_student("student", "pass", teacher1.id)
    
    lessons_before = database_all.get_student_lessons(student.id)

    # Уроки основного преподавателя
    lesson1 = database_all.add_lesson("Math", "Algebra", teacher1.id)
    lesson2 = database_all.add_lesson("Physics", "Mechanics", teacher1.id)
    lesson3 = database_all.add_lesson("Chemistry", "Atoms", teacher1.id)
    database_all.add_lesson_dependencies(lesson1.id, [student.id])
    database_all.add_lesson_dependencies(lesson2.id, [student.id])
    database_all.add_lesson_dependencies(lesson3.id, [student.id])
    
    # Получаем уроки студента
    lessons = database_all.get_student_lessons(student.id)
    lesson_ids = {lesson.id for lesson in lessons}
    
    # Проверяем, что есть все нужные уроки
    assert len(lessons) == 3 + len(lessons_before)
    assert lesson1.id in lesson_ids
    assert lesson2.id in lesson_ids
    assert lesson3.id in lesson_ids


def test_get_teacher_lessons(database_all):
    teacher = database_all.register_teacher("teacher3", "pass3", "Коваленко Кирилл")
    
    # Create lessons for the teacher
    lesson1 = database_all.add_lesson("Biology", "Cells", teacher.id)
    lesson2 = database_all.add_lesson("Geography", "Countries", teacher.id)
    
    # Get teacher's lessons
    lessons = database_all.get_teacher_lessons(teacher.id)
    assert len(lessons) == 2
    assert {l.id for l in lessons} == {lesson1.id, lesson2.id}


def test_update_lesson(database_all):
    teacher = database_all.register_teacher("teacher4", "pass4", "Коваленко Кирилл")
    lesson = database_all.add_lesson("History", "Ancient", teacher.id)
    
    # Update lesson
    updated = database_all.update_lesson(lesson.id, title="Modern History", content="20th Century")
    assert updated.title == "Modern History"
    assert updated.content == "20th Century"
    assert updated.teacher_id == teacher.id


def test_delete_lesson_with_dependencies(database_all):
    teacher = database_all.register_teacher("del_teacher", "pass", "Коваленко Кирилл")
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