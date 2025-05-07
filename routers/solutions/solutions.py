from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from DataBaseManager.extends import DBALL
from routers.solutions.schems import (
    StudentSolutionResponse,
    ResponseOneSolution,
    ResponseSolutionList,
    StudentSolutionCreate,
    ResponseMessage,
    TaskSolutionResponse,
    TaskSolutionsList,
)
from utils.utils import generate_json
from pydantic import BaseModel
from datetime import datetime, timezone
import pytz

router = APIRouter()


@router.get("/student_solutions/{solution_id}", response_class=JSONResponse)
async def get_student_solution_by_id(solution_id: int):
    solution = DBALL().get_student_solution_by_id(solution_id)
    if not solution:
        raise HTTPException(status_code=404, detail={"error": "Solution not found"})

    result = StudentSolutionResponse(
        id=solution.id,
        student_id=solution.student_id,
        task_id=solution.task_id,
        text=solution.text,
        result=solution.result,
        state=solution.state,
        created_at=solution.created_at.isoformat(),
    )
    return generate_json(ResponseOneSolution.model_validate({
        "result": result,
        "msg": "ok",
        "code": 200
    }))


@router.get("/student_solutions/task/{task_id}/{student_id}", response_class=JSONResponse)
async def get_student_solutions_by_task(task_id: int, student_id: int):
    solutions = DBALL().get_student_task_solutions(student_id, task_id, states=[1, 2, 3, 4])

    result = [StudentSolutionResponse(
        id=s.id,
        student_id=s.student_id,
        task_id=s.task_id,
        text=s.text,
        result=s.result,
        state=s.state,
        created_at=s.created_at.isoformat(),
    ) for s in solutions]

    return generate_json(ResponseSolutionList.model_validate({
        "result": result,
        "msg": "ok",
        "code": 200
    }))

@router.get("/student_solutions/task/{task_id}", response_class=JSONResponse)
async def get_student_solutions_by_task(task_id: int, request: Request):
    student_id = request.state.session_data.id
    solutions = DBALL().get_student_task_solutions(student_id, task_id, states=[1, 2, 3, 4])

    result = [StudentSolutionResponse(
        id=s.id,
        student_id=s.student_id,
        task_id=s.task_id,
        text=s.text,
        result=s.result,
        state=s.state,
        created_at=s.created_at.strftime("%Y-%m-%d %H:%M:%S"),
    ) for s in solutions]

    return generate_json(ResponseSolutionList.model_validate({
        "result": result,
        "msg": "ok",
        "code": 200
    }))

@router.get("/latest_student_solution/task/{task_id}/{student_id}", response_class=JSONResponse)
async def get_latest_student_solution_by_task(task_id: int, student_id: int):
    solutions = DBALL().get_student_task_solutions(student_id, task_id, states=[1, 2, 3, 4])

    if not solutions:
        raise HTTPException(status_code=404, detail={"error": "No solutions found"})

    latest = max(solutions, key=lambda s: s.created_at)

    result = StudentSolutionResponse(
        id=latest.id,
        student_id=latest.student_id,
        task_id=latest.task_id,
        text=latest.text,
        result=latest.result,
        state=latest.state,
        created_at=latest.created_at.isoformat(),
    )

    return generate_json(ResponseOneSolution.model_validate({
        "result": result,
        "msg": "ok",
        "code": 200
    }))


@router.post("/student_solutions", response_class=JSONResponse, status_code=201)
async def create_student_solution(data: StudentSolutionCreate, request: Request):
    # Получаем текущее время в UTC
    utc_now = datetime.now(timezone.utc)
    
    solution = DBALL().create_student_solution(
        student_id=request.state.session_data.id,
        task_id=data.task_id,
        text=data.text,
        result=None,  # по условию
        state=1,  # по умолчанию
    )

    # Конвертируем время в локальный часовой пояс для отображения
    local_tz = pytz.timezone('Europe/Moscow')
    local_created_at = solution.created_at.astimezone(local_tz)

    result = StudentSolutionResponse(
        id=solution.id,
        student_id=solution.student_id,
        task_id=solution.task_id,
        text=solution.text,
        result=solution.result,
        state=solution.state,
        created_at=local_created_at.isoformat(),
    )

    return JSONResponse(
        content={"result": result.model_dump()},
        status_code=201
    )

@router.get("/task/{task_id}/solutions", response_class=JSONResponse)
async def get_task_solutions(task_id: int):
    # Получаем все решения для задачи
    solutions = DBALL().get_task_solutions(task_id)

    if not solutions:
        return generate_json(TaskSolutionsList(
            solutions=[],
            msg="No solutions found",
            code=200
        ))

    # Преобразуем решения в формат ответа
    result = []
    for solution in solutions:
        # Получаем информацию о студенте
        student = DBALL().get_student_by_id(solution.student_id)
        student_name = student.login if student else "Неизвестный ученик"

        result.append(TaskSolutionResponse(
            id=solution.id,
            student_id=solution.student_id,
            student_name=student_name,
            task_id=solution.task_id,
            text=solution.text,
            result=solution.result,
            state=solution.state,
            created_at=solution.created_at.isoformat()
        ))

    return generate_json(TaskSolutionsList(
        solutions=result,
        msg="ok",
        code=200
    ))
