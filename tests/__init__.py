import pytest
from DataBaseManager.extends import *


# Очищаем данные из таблиц
def clear_all_data():
    with db.create_session() as conn:
        conn.execute(Students.__table__.delete())
        conn.execute(Lessons.__table__.delete())

        conn.execute(Teachers.__table__.delete())
        conn.commit()

# Создание таблиц и очистка после всех тестов
def create_data(db_all: DBALL):
    teacher1 = db_all.register_teacher("teacher1", "password1")
    teacher2 = db_all.register_teacher("teacher2", "password2")
    student1 = db_all.register_student("student1", "password1", teacher1.id)
    student2 = db_all.register_student("student2", "password2", teacher1.id)
    lesson1 = db_all.add_lesson("lesson1", "content lesson 1", teacher1.id, None)
    lesson2 = db_all.add_lesson("lesson2", "content lesson 2", teacher1.id, None)


@pytest.fixture(scope="module", autouse=True)
def setup_and_teardown():
    Base.metadata.create_all(bind=db.engine)
    create_data(DBALL(db))
    yield
    clear_all_data()


@pytest.fixture(scope="package", autouse=True)
def database_all():
    return DBALL(db)
