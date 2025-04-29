from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
from datetime import datetime
from DataBaseManager.extends import DBALL
from DataBaseManager.models import Lessons
from routers.lessons.schems import (
    LessonCreate, LessonUpdate, LessonDetailResponse,
    LessonShortResponse, LessonsListResponse, ResponseLesson, LongResponseLesson
)
from utils.utils import generate_json

router = APIRouter()


@router.get("/lessons", response_class=JSONResponse)
async def get_lessons(request: Request):
    session_data = request.state.session_data
    print(session_data)
    user_id = session_data.id
    user_state = session_data.state

    if user_state:
        lessons = DBALL().get_teacher_lessons(user_id)
    else:
        lessons = DBALL().get_student_lessons(user_id)
    result = [LessonShortResponse(
        id=lesson.id,
        title=lesson.title,
        description=lesson.content,
        teacher={"id": lesson.teacher_id, "name": DBALL().get_teacher_bio(lesson.teacher_id)},
        # тут имя учителя нужно вернуть
        created_at=lesson.created_at.isoformat()
    ) for lesson in sorted(lessons, key=lambda x: x.id, reverse=True)]

    return generate_json(LessonsListResponse.model_validate({
        "lessons": result, "msg": "ok", "code": 200
    }))


@router.post("/lessons", response_class=JSONResponse, status_code=201)
async def create_lesson(data: LessonCreate, request: Request):
    session_data = request.state.session_data

    if not data.title or not data.description:
        raise HTTPException(status_code=400, detail={
            "error": "Invalid data",
            "message": "Title and description are required"
        })

    teacher_id = session_data.id

    lesson = DBALL().add_lesson(data.title, data.description, teacher_id, None)
    print(lesson, DBALL().get_students_by_teacher(teacher_id))
    DBALL().add_lesson_dependencies(lesson.id, map(lambda x: x.id, DBALL().get_students_by_teacher(teacher_id)))
    lesson = DBALL().get_lesson_by_id(lesson.id)

    result = LessonShortResponse(
        id=lesson.id,
        title=lesson.title,
        description=lesson.content,
        teacher={"id": lesson.teacher_id, "name": DBALL().get_teacher_bio(lesson.teacher_id)},
        # тут имя учителя нужно вернуть
        created_at=lesson.created_at.isoformat()
    )

    return generate_json(ResponseLesson.model_validate({
        "result": result, "msg": "ok", "code": 201
    }))


@router.get("/lesson/{lesson_id}", response_class=JSONResponse)
async def get_lesson(lesson_id: int, request: Request):
    session_data = request.state.session_data

    user_id = session_data.id

    lesson = DBALL().get_lesson_by_id(lesson_id)
    if not lesson or lesson.teacher_id != user_id:
        raise HTTPException(status_code=404, detail={
            "error": "Lesson not found",
            "message": f"Lesson with ID {lesson_id} does not exist"
        })

    students = DBALL().get_students_from_lesson(lesson_id)

    result = LessonDetailResponse(
        id=lesson.id,
        title=lesson.title,
        description=lesson.content,
        teacher={"id": lesson.teacher_id, "name": DBALL().get_teacher_bio(lesson.teacher_id)},
        students=[{"id": s, "full_name": DBALL().get_student_by_id(s).bio} for s in students],
        created_at=lesson.created_at.isoformat()
    )

    return generate_json(LongResponseLesson.model_validate({
        "result": result, "msg": "ok", "code": 201
    }))


@router.put("/lesson/{lesson_id}", response_class=JSONResponse)
async def update_lesson(lesson_id: int, data: LessonUpdate, request: Request):
    session_data = request.state.session_data

    if not session_data or not session_data.state:
        return RedirectResponse(url="/")
    teacher_id = session_data.id

    lesson = DBALL().get_lesson_by_id(lesson_id)
    if not lesson or lesson.teacher_id != teacher_id:
        raise HTTPException(status_code=404, detail={
            "error": "Lesson not found",
            "message": f"Lesson with ID {lesson_id} does not exist"
        })

    lesson = DBALL().update_lesson(lesson_id, content=data.description, file_id=None if data.file_id == -1 else data.file_id)
    # print(lesson_id)
    # lesson = DBALL().get_lesson_by_id(lesson_id)

    result = LessonShortResponse(
        id=lesson.id,
        title=lesson.title,
        description=lesson.content,
        teacher={"id": lesson.teacher_id, "name": DBALL().get_teacher_bio(lesson.teacher_id)},
        # тут имя учителя нужно вернуть
        created_at=lesson.created_at.isoformat()
    )

    return generate_json(ResponseLesson.model_validate({
        "result": result, "msg": "ok", "code": 201
    }))


@router.delete("/lesson/{lesson_id}", response_class=JSONResponse)
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
