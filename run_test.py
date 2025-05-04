import pytest

if __name__ == "__main__":
    result = pytest.main([
        "tests/",  # <— запускаем все тесты в этой папке и подпапках
        "-q",  # подробный вывод
        "--disable-warnings",  # можно настроить лимит ошибок до остановки
    ])

    if result == 0:
        print("\n✅ Все тесты успешно прошли!")
    else:
        print("\n❌ Некоторые тесты упали.")
