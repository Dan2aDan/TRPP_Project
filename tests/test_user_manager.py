from tests import *


def test_is_student(database_all):
    teacher = database_all.register_teacher("12", "1")
    database_all.register_student("s1", "123", teacher.id)
    result = database_all.is_student("s1", "123")
    assert result
    assert result.login == "s1"


def test_is_teacher(database_all):
    database_all.register_teacher("t1", "abc")
    result = database_all.is_teacher("t1", "abc")
    assert result
    assert result.login == "t1"


def test_get_user_type_student(database_all):
    teacher = db.select(sqlalchemy.select(Teachers), types=db.any_)
    database_all.register_student("s2", "pw", teacher.id)
    result = database_all.get_user_type("s2", "pw")
    assert result
    assert isinstance(result, Students)


def test_get_user_type_teacher(database_all):
    database_all.register_teacher("t2", "pw")
    result = database_all.get_user_type("t2", "pw")
    assert result
    assert isinstance(result, Teachers)


def test_get_user_type_none(database_all):
    result = database_all.get_user_type("ghost", "nopass")
    assert result is None
