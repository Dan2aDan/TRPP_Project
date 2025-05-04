from tests import *
import os


def test_create_file(database_all):
    filename = "test_file.txt"
    content = b"Test content"

    # Создаем файл
    file_record = database_all.create_file(filename, content)

    # Проверяем запись в базе данных
    assert file_record is not None
    assert file_record.path == os.path.join("src", filename)
    # assert file_record.url == f"/src/{filename}"
    assert file_record.uploaded_at is not None

    # Проверяем, что файл существует в файловой системе
    assert os.path.exists(file_record.path)


def test_get_file_by_id(database_all):
    filename = "test_file2.txt"
    content = b"Another test"

    # Создаем файл
    file_record = database_all.create_file(filename, content)

    # Получаем файл по ID
    retrieved_file = database_all.get_file_by_id(file_record.id)

    # Проверяем, что файл найден и данные совпадают
    assert retrieved_file is not None
    assert retrieved_file.id == file_record.id
    assert retrieved_file.path == file_record.path
    # assert retrieved_file.url == file_record.url
    assert retrieved_file.uploaded_at == file_record.uploaded_at


def test_delete_file(database_all):
    filename = "test_file3.txt"
    content = b"Delete this"

    # Создаем файл
    file_record = database_all.create_file(filename, content)
    file_path = file_record.path
    file_id = file_record.id

    # Проверяем, что файл существует
    assert os.path.exists(file_path)

    # Удаляем файл
    result = database_all.delete_file(file_id)

    # Проверяем, что удаление успешно
    assert result is True

    # Проверяем, что файл удален из файловой системы
    assert not os.path.exists(file_path)

    # Проверяем, что запись удалена из базы данных
    retrieved_file = database_all.get_file_by_id(file_id)
    assert retrieved_file is None
