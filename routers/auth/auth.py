from http.server import HTTPServer
from uuid import UUID

import sqlalchemy
import uvicorn
from fastapi import FastAPI, Depends, Response, APIRouter
from fastapi.responses import JSONResponse
from starlette.responses import HTMLResponse

from DataBaseManager.UserManager import user_manager
from DataBaseManager.models import Students as Users, Teachers
# TODO исправить импорт + спец метод вообще нужны отдельные проверки на тонну всего а делать так просто ужасно,
#  задача уже у турпала, потом поменять
from routers.auth.auntefication import SessionData, get_session_data, create_session_user, backend, cookie
from routers.auth.schems import UserAuth, Response as AnswerResponse
from utils.utils import generate_json

router = APIRouter()


# TODO исправить здесь весь файл + под новый метод
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
