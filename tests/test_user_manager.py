import pytest
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from DataBaseManager.models import Base, Students, Teachers
from DataBaseManager.__init__ import db
from DataBaseManager.UserManager import UserManager
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
    # user_manager = UserManager(db)
    # teacher_result = user_manager.register_teacher("teacher", "pass123")
    # student1_result = user_manager.register_student("student_one", "pw1", teacher_result.id)
    # student2_result = user_manager.register_student("student_two", "pw2", teacher_result.id)

@pytest.fixture
def user_manager():
    return UserManager(db)

@pytest.fixture
def database_students():
    return DatabaseStudents(db)

@pytest.fixture
def database_teachers():
    return DatabaseTeachers(db)

def test_is_student(user_manager, database_students, database_teachers):
    teacher = database_teachers.register_teacher("12", "1")
    database_students.register_student("s1", "123", teacher.id)
    result = user_manager.is_student("s1", "123")
    assert result
    assert result.login == "s1"

def test_is_teacher(user_manager, database_teachers):
    database_teachers.register_teacher("t1", "abc")
    result = user_manager.is_teacher("t1", "abc")
    assert result
    assert result.login == "t1"


def test_get_user_type_student(user_manager, database_students):
    teacher = db.select(sqlalchemy.select(Teachers), types=db.any_)
    database_students.register_student("s2", "pw", teacher.id)
    result = user_manager.get_user_type("s2", "pw")
    assert result
    assert isinstance(result, Students)


def test_get_user_type_teacher(user_manager, database_teachers):
    database_teachers.register_teacher("t2", "pw")
    result = user_manager.get_user_type("t2", "pw")
    assert result
    assert isinstance(result, Teachers)


def test_get_user_type_none(user_manager):
    result = user_manager.get_user_type("ghost", "nopass")
    assert result is None
