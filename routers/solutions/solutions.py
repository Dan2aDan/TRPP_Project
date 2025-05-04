from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from DataBaseManager.extends import DBALL
from routers.solutions.schems import (
    StudentSolutionResponse,
    ResponseOneSolution,
    ResponseSolutionList,
    StudentSolutionCreate,
    ResponseMessage,
)
from utils.utils import generate_json

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
async def create_student_solution(data: StudentSolutionCreate):
    solution = DBALL().create_student_solution(
        student_id=data.student_id,
        task_id=data.task_id,
        text=data.text,
        result=None,  # по условию
        state=1  # по умолчанию
    )

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
        "msg": "created",
        "code": 201
    }))
