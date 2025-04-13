import pytest
from DataBaseManager.extends import *


# Очищаем данные из таблиц


# Создание таблиц и очистка после всех тестов


@pytest.fixture(scope="module", autouse=True)
def setup_and_teardown():
    Base.metadata.create_all(bind=db.engine)
    DBALL().clear_all_data()
    DBALL().create_data()
    yield
    DBALL().clear_all_data()


@pytest.fixture(scope="package", autouse=True)
def database_all():
    return DBALL(db)
