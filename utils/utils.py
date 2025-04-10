from pydantic import BaseModel
from starlette.responses import JSONResponse


def generate_json(model: BaseModel, **kwargs):

    return JSONResponse(content=model.model_dump(), status_code=model.code, **kwargs)


class _SingletonWrapper:
    """
    Класс-обeртка для реализации паттерна Одиночка.
    """
    def __init__(self, cls):
        self.__wrapped__ = cls  # Оригинальный класс
        self._instance = None   # Здесь будет храниться экземпляр класса

    def __call__(self, *args, **kwargs):
        """Возвращает единственный экземпляр класса"""
        if self._instance is None:
            self._instance = self.__wrapped__(*args, **kwargs)
        return self._instance
def singleton(cls):
    """
    Декоратор для класса, реализующий синглтон.
    """
    return _SingletonWrapper(cls)