from fastapi import APIRouter
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.responses import RedirectResponse

from DataBaseManager.extends import DBALL
from routers.auth.schems import SessionData
from routers.students.schems import Response as AnswerResponse, ResponseStudent, StudentAdd, StudentUpdate
from routers.students.schems import StudentResponse, StudentsListResponse
from utils.utils import generate_json

router = APIRouter()


@router.post("/add_student", response_class=JSONResponse)
async def add_student(item: StudentAdd, request: Request):
    teacher_id = request.state.session_data.id

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
            'bio': ''
        },
        "code": 200
    }))

    return response


@router.get("/students", response_class=JSONResponse)
async def get_students(request: Request):
    session_data: SessionData = request.state.session_data

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


@router.get("/{student_id}", response_class=JSONResponse)
async def get_student_by_id(student_id: int, request: Request):
    session_data = request.state.session_data

    if not session_data or not session_data.state:
        return RedirectResponse(url="/")

    teacher_id = session_data.id

    # Получаем студента из базы данных
    student = DBALL().get_student_by_id(student_id)

    # Проверяем, существует ли студент и принадлежит ли он данному учителю
    if not student or student.teacher_id != teacher_id:
        return generate_json(
            ResponseStudent.model_validate(
                {"result": None, "msg": "Student not found or access denied", "code": 404}
            )
        )

    # Формируем ответ с данными студента
    student_data = StudentResponse(
        id=student.id,
        login=student.login,
        bio=student.bio,
        teacher_id=student.teacher_id,
        password=student.password_hash
    )
    print(student_data)
    return generate_json(
        ResponseStudent.model_validate(
            {"result": student_data.model_dump(), "msg": "ok", "code": 200}
        )
    )


@router.put("/{student_id}", response_class=JSONResponse)
async def update_student(student_id: int, item: StudentUpdate, request: Request):
    teacher_id = request.state.session_data.id

    # Получаем студента из базы данных
    student = DBALL().get_student_by_id(student_id)

    # Проверяем, существует ли студент и принадлежит ли он данному учителю
    if not student or student.teacher_id != teacher_id:
        return generate_json(
            ResponseStudent.model_validate(
                {"result": None, "msg": "Student not found or access denied", "code": 404}
            )
        )

    DBALL().update_student(student_id, item.login, item.password)

    # Получаем обновленные данные
    updated_student = DBALL().get_student_by_id(student_id)
    student_data = StudentResponse(
        id=updated_student.id,
        login=updated_student.login,
        bio=updated_student.bio,
        teacher_id=updated_student.teacher_id,
        password=updated_student.password_hash
    )

    return generate_json(
        ResponseStudent.model_validate(
            {"result": student_data.model_dump(), "msg": "Student updated successfully", "code": 200}
        )
    )


@router.delete("/{student_id}", response_class=JSONResponse)
async def delete_student(student_id: int, request: Request):
    teacher_id = request.state.session_data.id

    # Получаем студента из  базы данных
    student = DBALL().get_student_by_id(student_id)

    # Проверяем, существует ли студент и принадлежит ли он данному учителю
    if not student or student.teacher_id != teacher_id:
        return generate_json(
            ResponseStudent.model_validate(
                {"result": None, "msg": "Student not found or access denied", "code": 404}
            )
        )

    # Удаляем студента
    DBALL().delete_student(student_id)

    return generate_json(
        ResponseStudent.model_validate(
            {"result": None, "msg": "Student deleted successfully", "code": 200}
        )
    )
