from tests import *


def test_create_lesson(database_all):
    teacher = database_all.get_obj_unique(Teachers)
    database_all.add_lesson("spec lesson1", "lesson1", teacher.id, None)
    lesson = db.select(sqlalchemy.select(Lessons).where(Lessons.title == "spec lesson1"))[0]

    assert lesson.title == "spec lesson1"
    assert lesson.content == 'lesson1'
    assert lesson.teacher_id == teacher.id


# def test_get_user_lessons(database_all):
#     teacher = database_all.get_obj_unique(Teachers)
#     student = database_all.register_student("student2", "pass2", teacher.id)
#
#     result = database_all.get_user_lessons(teacher.id)
#     assert result.id == student.id
#     assert result.login == "student2"


# def test_get_user_lessons_teacher(database_all):
#     # Создаем преподавателя
#     lesson = database_all.get_obj_unique()
#
#     lessons = database_all.get_teacher_lessons(teacher.id, is_teacher=True)
#     assert len(lessons) == 1
#     assert lessons[0].title == "Math"

#
# def test_get_user_lessons_student(database_all):
#     # Создаем преподавателя и студента
#     teacher = database_all.register_teacher("teacher2", "pass2")
#     student = database_all.register_student("student1", "pass1", teacher.id)
#
#     # Добавляем урок
#     database_all.add_lesson("Physics", "Mechanics", teacher.id, 1)
#
#     # Получаем уроки студента
#     lessons = database_all.get_user_lessons(student.id, is_teacher=False)
#     assert len(lessons) == 1
#     assert lessons[0].title == "Physics"
