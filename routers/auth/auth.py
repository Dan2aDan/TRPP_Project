from uuid import UUID

from fastapi import Depends, Response, APIRouter, Request
from fastapi.responses import JSONResponse

from DataBaseManager.UserManager import user_manager, sqlalchemy, db
from DataBaseManager.models import Teachers, Students
from routers.auth.auntefication import create_session_user, backend, cookie
from routers.auth.schems import UserAuth, Response as AnswerResponse
from utils.utils import generate_json

router = APIRouter()


@router.post("/register", response_class=JSONResponse)
async def registerUser(item: UserAuth):
    if user_manager.get_user_type(item.login, item.password):
        return generate_json(
            AnswerResponse.model_validate(
                {"msg": "A user with this login already exists", 'code': 200, 'result': None}))
    elif not item.login or not item.password:
        return generate_json(
            AnswerResponse.model_validate(
                {"result": None, "msg": "Login and password fields cannot be empty", 'code': 200}))
    user_manager.register_teacher(item.login, item.password)
    user = user_manager.get_user_type(item.login, item.password)
    response = generate_json(AnswerResponse.model_validate({"msg": "ok", "result":
        {'state': isinstance(user, Teachers), 'login': item.login}, "code": 200}))

    await create_session_user(response, id=user.id, login=item.login, state=isinstance(user, Teachers))
    return response


@router.post("/login", response_class=JSONResponse)
async def authenticate(item: UserAuth):
    if not item.login or not item.password:
        return generate_json(
            AnswerResponse.model_validate(
                {"result": None, "msg": "Login and password fields cannot be empty", 'code': 200}))
    user = user_manager.get_user_type(item.login, item.password)
    if not user:
        return generate_json(
            AnswerResponse.model_validate({"result": None, "msg": "User not found", 'code': 404}))
    response = generate_json(
        AnswerResponse.model_validate({"result": {'state': isinstance(user, Teachers), 'login': item.login}, "msg":
            "ok", 'code': 200}))
    await create_session_user(response, id=user.id, login=item.login, state=isinstance(user, Teachers))
    return response


@router.post("/logout")
async def del_session(response: Response, session_id: UUID = Depends(cookie)):
    await backend.delete(session_id)
    cookie.delete_from_response(response)
    return "ok"


@router.get("/current", response_class=JSONResponse)
async def get_current_user_info(request: Request):
    print(request)
    session_data = request.state.session_data
    print(session_data)

    if session_data.state:  # Teacher
        query = sqlalchemy.select(Teachers).where(Teachers.login == session_data.login)
        user_data = db.select(query, types=db.any_)
        if not user_data:
            return generate_json(
                AnswerResponse.model_validate({"result": None, "msg": "Teacher not found", 'code': 404}))

        return generate_json(AnswerResponse.model_validate({
            "result": {
                "id": user_data.id,
                "login": user_data.login,
                "bio": user_data.bio,
                "type": True
            },
            "msg": "ok",
            "code": 200
        }))
    else:  # Student
        query = sqlalchemy.select(Students).where(Students.login == session_data.login)
        user_data = db.select(query, types=db.any_)
        if not user_data:
            return generate_json(
                AnswerResponse.model_validate({"result": None, "msg": "Student not found", 'code': 404}))

        return generate_json(AnswerResponse.model_validate({
            "result": {
                "id": user_data.id,
                "login": user_data.login,
                "bio": user_data.bio,
                "teacher_id": user_data.teacher_id,
                "type": False
            },
            "msg": "ok",
            "code": 200
        }))
