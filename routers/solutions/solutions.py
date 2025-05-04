# routers/tasks/tasks.py
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
from DataBaseManager.extends import DBALL
from routers.tasks.schems import (
    TaskShortResponse, TasksListResponse, TaskCreate, TaskUpdate,
    ResponseTask, TaskBigResponse
)
from utils.utils import generate_json
router = APIRouter()


@router.get("/", response_class=JSONResponse)
async def get_sulutions(request: Request):
    session_data = request.state.session_data
    user_state = session_data.state


# Получить решение ученика по id решения(id решения);
# получить решения ученика по задаче(id задачи);
# создать решение(параметр result пустой)

#------
# создать файл (бинарник файла, то к чему его нужно прикрепить (тип к чему прикрепить и его id))
# получить файл (id файла)
# удалить файл (id файла) -проверить к чему прикреплен и открепить




