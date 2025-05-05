import asyncio
import ast
import sys
import io
import traceback
from multiprocessing import Process, Queue
from typing import Optional, Tuple

class ExecutionResult:
    def __init__(self, output: str, error: Optional[str] = None, execution_time: float = 0.0):
        self.output = output
        self.error = error
        self.execution_time = execution_time
        self.success = error is None

    def __str__(self):
        if self.success:
            return f"Success: {self.output}"
        return f"Error: {self.error}"

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
        # Создаем безопасное окружение для выполнения кода
        safe_globals = {
            '__builtins__': {
                'print': print,
                'input': input,
                'len': len,
                'range': range,
                'str': str,
                'int': int,
                'float': float,
                'list': list,
                'dict': dict,
                'set': set,
                'tuple': tuple,
            }
        }
        
        # Выполняем код
        exec(code_str, safe_globals)
        output = sys.stdout.getvalue()
        queue.put(ExecutionResult(output=output))
        
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        queue.put(ExecutionResult(output="", error=error_msg))
        
    finally:
        sys.stdout = old_stdout
        sys.stdin = old_stdin

class AsyncCode:
    def __init__(self, code_str: str, allowed_modules: Optional[set] = None):
        self.code_str = code_str
        self.allowed_modules = allowed_modules or set()
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

async def execute_code_with_timeout(code_str: str, input_text: str, timeout: float = 5) -> ExecutionResult:
    """
    Выполняет код в отдельном процессе и ожидает его завершения в течение timeout секунд.
    Если процесс не завершается за timeout, принудительно завершает его и выбрасывает исключение.
    Возвращает результат выполнения.
    """
    q = Queue()
    p = Process(target=_execute_code_func_process, args=(code_str, input_text, q))
    p.start()
    
    try:
        # Ждем результат с таймаутом
        result = await asyncio.wait_for(asyncio.get_event_loop().run_in_executor(None, q.get), timeout)
        return result
    except asyncio.TimeoutError:
        p.terminate()
        p.join()
        return ExecutionResult(output="", error="Timeout: Task execution took too long")
    finally:
        if p.is_alive():
            p.terminate()
            p.join()

class Runner:
    def __init__(self, code: AsyncCode, test_input: str):
        self.code = code
        self.test_input = test_input

    async def run(self) -> ExecutionResult:
        """
        Запускает код с тестовыми входными данными.
        Возвращает результат выполнения.
        """
        return await execute_code_with_timeout(str(self.code), self.test_input)

