import datetime
import functools
from fastapi.responses import JSONResponse
class Logger:
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

    @staticmethod
    def log(message: str, level):
        print(f'{datetime.datetime.now().strftime("%d/%m/%Y, %H:%M:%S")} -: {level} {message}')
