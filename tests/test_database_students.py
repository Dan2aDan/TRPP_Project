import pytest
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from DataBaseManager.models import Base, Students, Teachers
from DataBaseManager.__init__ import db
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

@pytest.fixture
def database_students():
    return DatabaseStudents(db)

@pytest.fixture
def setup_teacher(database_students):
    return database_students.db.select(sqlalchemy.select(Teachers), types=db.any_)

def test_register_student(database_students, setup_teacher):
    teacher = setup_teacher
    result = database_students.register_student("student1", "pass1", teacher.id)
    assert result
    assert result.login == "student1"
    assert result.password_hash == "pass1"
    assert result.teacher_id == teacher.id

def test_get_student_by_id(database_students, setup_teacher):
    teacher = setup_teacher
    student = database_students.register_student("student2", "pass2", teacher.id)
    result = database_students.get_student_by_id(student.id)
    assert result.id == student.id
    assert result.login == "student2"

def test_update_student(database_students, setup_teacher):
    teacher = setup_teacher
    student = database_students.register_student("student3", "pass3", teacher.id)
    updated = database_students.update_student(student.id, login="new_login", password_hash="new_password" ,bio="New bio")
    assert updated.login == "new_login"
    assert updated.password_hasg == "new_password"
    assert updated.bio == "New bio"

def test_delete_student(database_students, setup_teacher):
    teacher = setup_teacher
    student = database_students.register_student("student4", "pass4", teacher.id)
    assert database_students.delete_student(student.id)
    assert database_students.get_student_by_id(student.id) is None