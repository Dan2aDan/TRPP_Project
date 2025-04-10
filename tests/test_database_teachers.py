import pytest
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from DataBaseManager.models import Base, Students, Teachers
from DataBaseManager.__init__ import db
from DataBaseManager.DatabaseTeachers import DatabaseTeachers
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
def database_teachers():
    return DatabaseTeachers(db)

def test_register_teacher(database_teachers):
    result = database_teachers.register_teacher("teacher1", "pass2")
    assert result
    assert result.login == "teacher1"
    assert result.password_hash == "pass2"
    assert result.bio == ""

def test_get_teacher_students(database_teachers):
    teacher = database_teachers.register_teacher("teacher2", "pass3")
    database_students = DatabaseStudents(db)
    student1 = database_students.register_student("s1", "p1", teacher.id)
    student2 = database_students.register_student("s2", "p2", teacher.id)
    
    students = database_teachers.get_teacher_students(teacher.id)
    assert len(students) == 2
    assert students[0].id in [student1.id, student2.id]
    assert students[1].id in [student1.id, student2.id]