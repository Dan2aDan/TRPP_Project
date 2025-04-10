import pytest
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from DataBaseManager.models import Base, Students, Teachers
from DataBaseManager.__init__ import db
from DataBaseManager.DatabaseLessons import DatabaseLessons


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


def test_get_user_lessons(database_lessons):
    pass

def test_get_lesson_tasks(database_lessons):
    pass