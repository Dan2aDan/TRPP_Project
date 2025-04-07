import asyncio
import ast
import sys
import io
from multiprocessing import Process, Queue


def _execute_code_func_process(code_str: str, input_text: str, queue: Queue):
    """
    Выполняет переданный код в изолированном процессе.
    Перенаправляет sys.stdout и sys.stdin, чтобы подставить входные данные и захватить вывод.
    Результат (вывод) кладется в очередь.
    """
    old_stdout = sys.stdout
    old_stdin = sys.stdin
    sys.stdout = io.StringIO()
    sys.stdin = io.StringIO(input_text)
    try:
        exec(code_str, {})
        output = sys.stdout.getvalue()
    except Exception as e:
        output = f"Error during execution: {e}"
    finally:
        sys.stdout = old_stdout
        sys.stdin = old_stdin
    queue.put(output)


class AsyncCode:
    def __init__(self, code_str, allowed_modules=None):
        self.code_str = code_str
        self.allowed_modules = allowed_modules or set()
        self.output = None
        self.check_code()

    def check_code(self):
        """
        Анализирует код:
         - Если импортируется модуль, которого нет в разрешённом списке, выбрасывается исключение.
         - Также проверяет синтаксис кода.
        """
        try:
            tree = ast.parse(self.code_str)
        except SyntaxError as e:
            raise ValueError(f"Синтаксическая ошибка в коде: {e}")

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name not in self.allowed_modules:
                        raise ValueError(f"Использование модуля '{alias.name}' запрещено")
            elif isinstance(node, ast.ImportFrom):
                if node.module not in self.allowed_modules:
                    raise ValueError(f"Использование модуля '{node.module}' запрещено")
        return True

    def __str__(self):
        return self.code_str

    def __repr__(self):
        return self.code_str


def _execute_code_with_timeout(code_str: str, input_text: str, timeout: float = 5) -> str:
    """
    Выполняет код в отдельном процессе и ожидает его завершения в течение timeout секунд.
    Если процесс не завершается за timeout, принудительно завершает его и выбрасывает исключение.
    Возвращает вывод, переданный через очередь.
    """
    q = Queue()
    p = Process(target=_execute_code_func_process, args=(code_str, input_text, q))
    p.start()
    p.join(timeout)
    if p.is_alive():
        p.terminate()
        p.join()
        raise Exception("Timeout: Task execution took too long")
    # Если очередь пуста — вернуть пустую строку
    output = q.get() if not q.empty() else ""
    return output


class Runner:
    def __init__(self, task_g: AsyncCode, task_e: AsyncCode, tests: list[str]):
        self.task_g = task_g
        self.task_e = task_e
        self.tests = tests

    async def run_and_compare(self, input_text: str):
        """
        Асинхронно запускает оба куска кода с входными данными input_text.
        Если выполнение занимает более timeout секунд, генерируется исключение.
        Если выводы отличаются — также генерируется исключение.
        """
        loop = asyncio.get_running_loop()
        # Запускаем оба процесса через run_in_executor, чтобы не блокировать event loop.
        task1 = loop.run_in_executor(None, _execute_code_with_timeout, str(self.task_g), input_text, 5)
        task2 = loop.run_in_executor(None, _execute_code_with_timeout, str(self.task_e), input_text, 5)
        res1, res2 = await asyncio.gather(task1, task2)
        if res1 != res2:
            raise Exception(f"Outputs differ:\n{res1}\n != \n{res2}")
        return res1, res2

    async def run(self):
        """
        Для каждого тестового входа запускает сравнение двух программ.
        Если все тесты проходят, возвращает "ok", иначе — сообщение об ошибке.
        """
        try:
            for test in self.tests:
                await self.run_and_compare(test)
            return "ok"
        except Exception as e:
            return str(e)


# Пример использования
async def main():
    # Пример кода: первая программа засыпает на 10 секунд, вторая — на 1 секунду
    code_str1 = """
print(open("logger.py").read())
"""
    code_str2 = """
print(open("logger.py").read())

"""
    # Разрешаем использовать модуль time
    try:
        bibl = {'time', 'random', 'math', 'functools'}
        task1 = AsyncCode(code_str1, allowed_modules=bibl)
        task2 = AsyncCode(code_str2, allowed_modules=bibl)
    except Exception as e:
        print("Ошибка проверки кода:", e)
        return

    # Один тестовый вход (например, пустой ввод)
    runner = Runner(task1, task2, tests=[''])
    try:
        result = await runner.run()
    except Exception as e:
        result = str(e)
    print("Captured output:")
    print(result)


if __name__ == "__main__":
    asyncio.run(main())
    print("Done")
