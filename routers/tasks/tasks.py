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


@router.get("/tasks", response_class=JSONResponse)
async def get_tasks(request: Request):
    session_data = request.state.session_data
    user_id = session_data.id
    user_state = session_data.state  # учитель или ученик

    if user_state:
        tasks = DBALL().get_teacher_tasks(user_id)
    else:
        tasks = DBALL().get_student_tasks(user_id)
    result = [TaskShortResponse(
        id=task.id,
        lesson_id=task.lesson_id,
        description=task.description,
        created_at=task.created_at.isoformat(),
        test=task.test
    ) for task in tasks]

    return generate_json(TasksListResponse.model_validate({
        "tasks": result,
        "msg": "ok",
        "code": 200
    }))


@router.post("/tasks", response_class=JSONResponse, status_code=201)
async def create_task(data: TaskCreate, request: Request):
    session_data = request.state.session_data

    if not data.lesson_id or not data.description:
        raise HTTPException(status_code=400, detail={
            "error": "Invalid data",
            "message": "Title and description are required"
        })
    task = DBALL().add_task(data.lesson_id, data.description, data.test)
    solution = DBALL().create_teacher_solution(session_data.id, task.id, data.text_program)
    DBALL().update_task(task.id, solution=solution.id)

    result = TaskShortResponse(
        id=task.id,
        lesson_id=task.lesson_id,
        description=task.description,
        created_at=task.created_at.isoformat(),
        test=task.test
    )

    return generate_json(ResponseTask.model_validate({
        "result": result,
        "msg": "ok",
        "code": 201
    }))


@router.get("/tasks/{task_id}", response_class=JSONResponse)
async def get_task(task_id: int, request: Request):
    task = DBALL().get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail={
            "error": "Task not found",
            "message": f"Task with ID {task_id} does not exist"
        })
    teacher_solution = DBALL().get_teacher_task_solutions(request.state.session_data.id, task.id)
    result = TaskBigResponse(
        id=task.id,
        lesson_id=task.lesson_id,
        description=task.description,
        created_at=task.created_at.isoformat(),
        test=task.test,
        text=teacher_solution.text,
        result=teacher_solution.result,
    )

    return generate_json(ResponseTask.model_validate({
        "result": result,
        "msg": "ok",
        "code": 201
    }))


@router.get("/tasks/{lesson_id}/tasks", response_class=JSONResponse)
async def get_task(lesson_id: int, request: Request):
    tasks = DBALL().get_lesson_tasks(lesson_id)

    result = [TaskShortResponse(
        id=task.id,
        lesson_id=task.lesson_id,
        description=task.description,
        created_at=task.created_at.isoformat(),
        test=task.test,
    ) for task in tasks]

    return generate_json(TasksListResponse.model_validate({
        "tasks": result,
        "msg": "ok",
        "code": 200
    }))


@router.put("/tasks/{task_id}", response_class=JSONResponse)
async def update_task(task_id: int, data: TaskUpdate, request: Request):
    session_data = request.state.session_data

    if not session_data or not session_data.state:
        return RedirectResponse(url="/")
    teacher_id = session_data.id

    task = DBALL().get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail={
            "error": "Task not found",
            "message": f"Task with ID {task_id} does not exist"
        })

    updated_task = DBALL().update_task(task_id, data.description)

    result = TaskShortResponse(
        id=task.id,
        lesson_id=task.lesson_id,
        description=task.description,
        created_at=task.created_at.isoformat(),
        test=task.test,
    )

    return generate_json(ResponseTask.model_validate({
        "result": result,
        "msg": "ok",
        "code": 201
    }))


@router.delete("/tasks/{task_id}", response_class=JSONResponse)
async def delete_task(task_id: int, request: Request):
    session_data = request.state.session_data

    task = DBALL().get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail={
            "error": "Task not found",
            "message": f"Task with ID {task_id} does not exist"
        })

    DBALL().delete_task(task_id)

    return JSONResponse(content={"message": "Task deleted successfully"})
