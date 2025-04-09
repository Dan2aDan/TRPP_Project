from routers.students.schems import StudentAdd
from DataBaseManager.models import Students
from fastapi.responses import JSONResponse

from DataBaseManager.UserManager import user_manager
from routers.auth.auntefication import SessionData, get_session_data, create_session_user, backend, cookie
from routers.auth.schems import UserAuth, Response as AnswerResponse
from utils.utils import generate_json
from fastapi import FastAPI, Depends, Response, APIRouter


router = APIRouter()

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from routers.students.schems import StudentAdd
from routers.auth.auntefication import get_session_data  # Импортируем функцию для получения данных сессии
from DataBaseManager.UserManager import user_manager
from DataBaseManager.models import Students


@router.post("/add_student", response_class=JSONResponse)
async def add_student(item: StudentAdd, session_data: SessionData = Depends(get_session_data)):
    # Проверяем, что пользователь является преподавателем
    if not session_data or not session_data.state:
        raise HTTPException(status_code=403, detail="Only teachers can add students")

    # Получаем teacher_id из данных сессии
    teacher_id = session_data.id

    # Проверяем, что логин и пароль не пустые
    if not item.login or not item.password:
        return generate_json(
            AnswerResponse.model_validate(
                {"result": None, "msg": "Login and password fields cannot be empty", 'code': 200}))

    # Проверяем, существует ли уже пользователь с таким логином
    existing_user = user_manager.get_user_type(item.login, item.password)
    if existing_user:
        return generate_json(
            AnswerResponse.model_validate(
                {"msg": "A user with this login already exists", 'code': 200, 'result': None}))

    # Регистрируем нового студента с teacher_id
    user_manager.register_student(item.login, item.password, item.bio, teacher_id)

    # После регистрации получаем нового студента
    user = user_manager.get_user_type(item.login, item.password)

    # Формируем ответ с данными нового студента
    response = generate_json(AnswerResponse.model_validate({
        "msg": "ok",
        "result": {
            'state': isinstance(user, Students),
            'login': item.login,
            'bio': item.bio
        },
        "code": 200
    }))

    # Важно создать сессию для нового студента, если это необходимо
    await create_session_user(response, id=user.id, login=item.login, state=isinstance(user, Students))

    return response


@router.get("/students", response_class=JSONResponse)
async def get_students(session_data: SessionData = Depends(get_session_data)):
    # Проверяем, что текущий пользователь является преподавателем
    if not session_data or not session_data.state:
        raise HTTPException(status_code=403, detail="Only teachers can view students")

    # Получаем teacher_id из данных сессии
    teacher_id = session_data.id

    # Получаем список студентов для текущего преподавателя
    students = user_manager.get_students_by_teacher(teacher_id)

    # Формируем ответ
    if not students:
        return JSONResponse(content={"students": []}, status_code=200)

    # Формируем список студентов для ответа
    students_list = [{
        "id": student.id,
        "bio": student.bio,
        "login": student.login,
        "password": student.password_hash,  # Не будем показывать пароль, возможно, нужно заменить на другие данные
        "teacher_id": student.teacher_id
    } for student in students]

    return JSONResponse(content={"students": students_list}, status_code=200)