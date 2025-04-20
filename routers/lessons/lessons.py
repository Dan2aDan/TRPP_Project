from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
from datetime import datetime
from DataBaseManager.extends import DBALL
from routers.lessons.schems import (
    LessonCreate, LessonUpdate, LessonDetailResponse,
    LessonShortResponse, LessonsListResponse, ErrorResponse
)
from utils.utils import generate_json

router = APIRouter()


@router.get("/lessons", response_class=JSONResponse)
async def get_lessons(request: Request):
    session_data = request.state.session_data
    user_id = session_data.id
    user_role = session_data.role

    if user_role == "teacher":
        lessons = DBALL().get_lessons_by_teacher(user_id)
    else:
        lessons = DBALL().get_lessons_by_student(user_id)

    result = [LessonShortResponse(
        id=lesson.id,
        title=lesson.title,
        description=lesson.content,
        date=lesson.date,
        teacher={"id": lesson.teacher_id, "name": lesson.teacher_name},
        students_count=lesson.students_count,
        created_at=lesson.created_at
    ) for lesson in lessons]

    return generate_json(LessonsListResponse.model_validate({
        "lessons": result
    }))


@router.post("/lessons", response_class=JSONResponse, status_code=201)
async def create_lesson(data: LessonCreate, request: Request):
    session_data = request.state.session_data
    teacher_id = session_data.id

    if not data.title or not data.date:
        raise HTTPException(status_code=400, detail={
            "error": "Invalid data",
            "message": "Title and date are required"
        })

    lesson_id = DBALL().create_lesson(data.title, data.description, data.date, teacher_id, data.students)
    lesson = DBALL().get_lesson_by_id(lesson_id)

    return JSONResponse(status_code=201, content={
        "id": lesson.id,
        "title": lesson.title,
        "description": lesson.content,
        "date": lesson.date,
        "students_count": len(data.students),
        "created_at": lesson.created_at
    })


@router.get("/lessons/{lesson_id}", response_class=JSONResponse)
async def get_lesson(lesson_id: int, request: Request):
    session_data = request.state.session_data
    user_id = session_data.id
    user_role = session_data.role

    lesson = DBALL().get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail={
            "error": "Lesson not found",
            "message": f"Lesson with ID {lesson_id} does not exist"
        })

    if user_role == "teacher" and lesson.teacher_id != user_id:
        return RedirectResponse(url="/")

    students = DBALL().get_lesson_students(lesson_id)

    return generate_json(LessonDetailResponse.model_validate({
        "id": lesson.id,
        "title": lesson.title,
        "description": lesson.content,
        "date": lesson.date,
        "teacher": {"id": lesson.teacher_id, "name": lesson.teacher_name},
        "students": [{"id": s.id, "full_name": s.full_name} for s in students],
        "created_at": lesson.created_at
    }))


@router.put("/lessons/{lesson_id}", response_class=JSONResponse)
async def update_lesson(lesson_id: int, data: LessonUpdate, request: Request):
    session_data = request.state.session_data
    teacher_id = session_data.id

    lesson = DBALL().get_lesson_by_id(lesson_id)
    if not lesson or lesson.teacher_id != teacher_id:
        raise HTTPException(status_code=404, detail={
            "error": "Lesson not found",
            "message": f"Lesson with ID {lesson_id} does not exist"
        })

    DBALL().update_lesson(lesson_id, data.title, data.description, data.date, data.students)

    return JSONResponse(content={
        "id": lesson_id,
        "title": data.title,
        "description": data.description,
        "date": data.date,
        "students_count": len(data.students),
        "updated_at": datetime.utcnow().isoformat()
    })


@router.delete("/lessons/{lesson_id}", response_class=JSONResponse)
async def delete_lesson(lesson_id: int, request: Request):
    session_data = request.state.session_data
    teacher_id = session_data.id

    lesson = DBALL().get_lesson_by_id(lesson_id)
    if not lesson or lesson.teacher_id != teacher_id:
        raise HTTPException(status_code=404, detail={
            "error": "Lesson not found",
            "message": f"Lesson with ID {lesson_id} does not exist"
        })

    DBALL().delete_lesson(lesson_id)

    return JSONResponse(content={"message": "Lesson deleted successfully"})
