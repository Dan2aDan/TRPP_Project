import pytest
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from DataBaseManager.models import Base, Students, Teachers
from DataBaseManager.__init__ import db
from DataBaseManager.DatabaseLessons import DatabaseLessons
from DataBaseManager.DatabaseStudents import DatabaseStudents


# Очищаем данные из таблиц
def clear_all_data():
    with db.create_session() as conn:
        conn.execute(Students.__table__.delete())
        conn.execute(Teachers.__table__.delete())
        conn.commit()

# Создание таблиц и очистка после всех тестов
@pytest.fixture(scope="module", autouse=True)
def setup_and_teardown():
    Base.metadata.create_all(bind=db.engine)
    yield
    clear_all_data()
    # Финальная инициализация, для работы проекта
    # database_teachers = DatabaseTeachers(db)
    # teacher_result = database_students.register_teacher("teacher", "pass123")
    # student1_result = database_students.register_student("student_one", "pw1", teacher_result.id)
    # student2_result = database_students.register_student("student_two", "pw2", teacher_result.id)

@pytest.fixture
def database_lessons():
    return DatabaseLessons(db)

@pytest.fixture
def database_students():
    return DatabaseStudents(db)

@pytest.fixture
def database_teachers():
    return DatabaseStudents(db)


def test_get_user_lessons(database_lessons):
    teacher = database_teachers.register_teacher("12", "1")

    # student = database_students.register_student("student2", "pass2", teacher.id)
    result = database_lessons.get_user_lessons(teacher.id)
    assert result.id == student.id
    assert result.login == "student2"
    

def test_get_user_lessons_teacher(database_lessons, database_teachers):
    # Создаем преподавателя
    teacher = database_teachers.register_teacher("teacher1", "pass1")
    
    # Добавляем урок
    lesson = database_lessons.add_lesson("Math", "Algebra", teacher.id, 1)
    
    # Получаем уроки преподавателя
    lessons = database_lessons.get_user_lessons(teacher.id, is_teacher=True)
    assert len(lessons) == 1
    assert lessons[0].title == "Math"

def test_get_user_lessons_student(database_lessons, database_teachers, database_students):
    # Создаем преподавателя и студента
    teacher = database_teachers.register_teacher("teacher2", "pass2")
    student = database_students.register_student("student1", "pass1", teacher.id)
    
    # Добавляем урок
    database_lessons.add_lesson("Physics", "Mechanics", teacher.id, 1)
    
    # Получаем уроки студента
    lessons = database_lessons.get_user_lessons(student.id, is_teacher=False)
    assert len(lessons) == 1
    assert lessons[0].title == "Physics"