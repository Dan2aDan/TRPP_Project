from tests import *


def test_add_lesson(database_all):
    teacher = database_all.get_obj_unique(Teachers)
    database_all.add_lesson("spec lesson1", "lesson1", teacher.id, None)
    lesson = db.select(sqlalchemy.select(Lessons).where(Lessons.title == "spec lesson1"))[0]

    assert lesson.title == "spec lesson1"
    assert lesson.content == 'lesson1'
    assert lesson.teacher_id == teacher.id


def test_get_lesson_by_id(database_all):
    teacher = database_all.register_teacher("teacher1", "pass1")
    lesson = database_all.add_lesson("Math", "Algebra", teacher.id)
    
    result = database_all.get_lesson_by_id(lesson.id)
    assert result.id == lesson.id
    assert result.title == "Math"
    assert result.content == "Algebra"


def test_get_student_lessons(database_all):
    teacher = database_all.register_teacher("teacher2", "pass2")
    student = database_all.register_student("student1", "pass1", teacher.id)
    
    # Create lessons for the teacher
    lesson1 = database_all.add_lesson("Physics", "Mechanics", teacher.id)
    lesson2 = database_all.add_lesson("Chemistry", "Atoms", teacher.id)
    
    # Get lessons for the student (should be the same as teacher's lessons)
    lessons = database_all.get_student_lessons(student.id)
    assert len(lessons) == 2
    assert {l.id for l in lessons} == {lesson1.id, lesson2.id}


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


def test_delete_lesson(database_all):
    teacher = database_all.register_teacher("teacher5", "pass5")
    lesson = database_all.add_lesson("Art", "Painting", teacher.id)
    
    # Delete lesson
    assert database_all.delete_lesson(lesson.id)
    
    # Verify deletion
    assert database_all.get_lesson_by_id(lesson.id) is None


def test_delete_lesson_with_tasks(database_all):
    teacher = database_all.register_teacher("teacher6", "pass6")
    student = database_all.register_student("student2", "pass2", teacher.id)
    lesson = database_all.add_lesson("Programming", "Python", teacher.id)
    
    # Add task and solution
    task = database_all.add_task(lesson.id, "Write a function", None)
    database_all.add_solution(task.id, student.id, "def func(): pass", None)
    
    # Delete lesson (should cascade delete tasks and solutions)
    assert database_all.delete_lesson(lesson.id)
    
    # Verify all related data was deleted
    assert database_all.get_lesson_by_id(lesson.id) is None
    assert len(database_all.get_tasks_by_lesson(lesson.id)) == 0