import pytest
import asyncio
from utils.autotest import AsyncCode, Runner

@pytest.mark.asyncio
async def test_simple_addition():
    """Тест на корректное выполнение простой программы"""
    code_str = """
a = int(input())
b = int(input())
print(a + b)
"""

    code = AsyncCode(code_str, allowed_modules=set())
    runner = Runner(code, "2\n3")
    result = await runner.run()

    assert result.success, f"Ошибка выполнения: {result.error}"
    assert result.output.strip() == "5", f"Неверный вывод: {result.output}"

@pytest.mark.asyncio
async def test_syntax_error():
    """Тест на обработку синтаксической ошибки"""
    code_str = """
a = int(input()
b = int(input())
print(a + b)
"""

    with pytest.raises(ValueError) as exc_info:
        AsyncCode(code_str, allowed_modules=set())

    assert "Синтаксическая ошибка" in str(exc_info.value)

@pytest.mark.asyncio
async def test_timeout():
    """Тест на обработку таймаута"""
    code_str = """
while True:
    pass
"""

    code = AsyncCode(code_str, allowed_modules=set())
    runner = Runner(code, "")
    result = await runner.run()

    assert not result.success, "Программа не должна завершиться успешно"
    assert "Timeout" in result.error, "Должен быть таймаут"

@pytest.mark.asyncio
async def test_input_output():
    """Тест на корректную работу с вводом/выводом"""
    code_str = """
name = input()
age = int(input())
print(f"Hello, {name}! You are {age} years old.")
"""

    code = AsyncCode(code_str, allowed_modules=set())
    runner = Runner(code, "John\n25")
    result = await runner.run()

    assert result.success, f"Ошибка выполнения: {result.error}"
    assert result.output.strip() == "Hello, John! You are 25 years old.", f"Неверный вывод: {result.output}"

@pytest.mark.asyncio()
async def test_error_handling():
    """Тест на обработку ошибок выполнения"""
    code_str = """
a = int(input())
b = int(input())
print(a / b)
"""
    
    code = AsyncCode(code_str, allowed_modules=set())
    runner = Runner(code, "5\n0")
    result = await runner.run()
    
    assert not result.success, "Должна быть ошибка деления на ноль"
    assert "ZeroDivisionError" in result.error, "Должна быть ошибка деления на ноль"

@pytest.mark.asyncio
async def test_input_complete():
    code_str = ("""
a = int(input())
print(a)""")
    code = AsyncCode(code_str, allowed_modules=set())
    runner = Runner(code, "5\n0")
    result = await runner.run()
    assert result.success, "lll"
    assert result.output.strip() == "5", f"ss"
