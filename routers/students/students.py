from fastapi import APIRouter
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.responses import RedirectResponse

from DataBaseManager.extends import DBALL
from DataBaseManager.models import Students
from routers.auth.auntefication import create_session_user
from routers.students.schems import Response as AnswerResponse
from routers.students.schems import StudentAdd
from routers.students.schems import StudentResponse, StudentsListResponse
from utils.utils import generate_json

router = APIRouter()


@router.post("/add_student", response_class=JSONResponse)
async def add_student(item: StudentAdd, request: Request):
    # Получаем session_data из middleware
    session_data = request.state.session_data

    # Проверяем, что пользователь является преподавателем
    if not session_data or not session_data.state:
        return RedirectResponse(url="/")

    # Получаем teacher_id из данных сессии
    teacher_id = session_data.id

    # Проверяем, что логин и пароль не пустые
    if not item.login or not item.password:
        return generate_json(
            AnswerResponse.model_validate(
                {"result": None, "msg": "Login and password fields cannot be empty", 'code': 400}))

    # Проверяем, существует ли уже пользователь с таким логином
    existing_user = DBALL().get_user_type(item.login, item.password)
    if existing_user:
        return generate_json(
            AnswerResponse.model_validate(
                {"msg": "A user with this login already exists", 'code': 400, 'result': None}))

    # Регистрируем нового студента с teacher_id
    DBALL().register_student(item.login, item.password, teacher_id)

    # После регистрации получаем нового студента
    user = DBALL().get_user_type(item.login, item.password)

    # Формируем ответ с данными нового студента
    response = generate_json(AnswerResponse.model_validate({
        "msg": "ok",
        "result": {
            'login': item.login,
            'bio': item.bio
        },
        "code": 200
    }))

    # Важно создать сессию для нового студента, если это необходимо
    await create_session_user(response, id=user.id, login=item.login, state=isinstance(user, Students))

    return response


@router.get("/students", response_class=JSONResponse)
async def get_students(request: Request):
    session_data = request.state.session_data

    if not session_data or not session_data.state:
        return RedirectResponse(url="/")

    teacher_id = session_data.id
    students = DBALL().get_students_by_teacher(teacher_id)

    students_list = [
        StudentResponse(
            id=student.id,
            login=student.login,
            bio=student.bio,
            teacher_id=student.teacher_id,
            password=student.password_hash
        )
        for student in students
    ]

    response = generate_json(StudentsListResponse.model_validate({"students": students_list, "msg": "ok", "code": 200}))

    return response
