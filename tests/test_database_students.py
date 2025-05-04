from tests import *


def test_register_student(database_all):
    teacher = database_all.register_teacher("teacher1", "password1", "bio")
    result = database_all.register_student("student20", "pass1", teacher.id)
    assert result
    assert result.login == "student20"
    assert result.password_hash == "pass1"
    assert result.teacher_id == teacher.id


def test_get_student_by_id(database_all):
    teacher = database_all.register_teacher("12", "1", "Коваленко Кирилл")
    student = database_all.register_student("student2", "pass2", teacher.id)
    result = database_all.get_student_by_id(student.id)
    assert result.id == student.id
    assert result.login == "student2"


def test_update_student(database_all):
    teacher = database_all.register_teacher("12", "1", "Коваленко Кирилл")
    student = database_all.register_student("student3", "pass3", teacher.id)
    updated = database_all.update_student(student.id, login="new_login", password_hash="new_password", bio="New bio")
    assert updated.login == "new_login"
    assert updated.password_hash == "new_password"
    assert updated.bio == "New bio"


def test_delete_student(database_all):
    teacher = database_all.register_teacher("12", "1", "Коваленко Кирилл")
    student = database_all.register_student("student4", "pass4", teacher.id)
    assert database_all.delete_student(student.id)
    assert database_all.get_student_by_id(student.id) is None
