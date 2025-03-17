from http.server import HTTPServer
from uuid import UUID

import sqlalchemy
import uvicorn
from fastapi import FastAPI, Depends, Response, APIRouter
from fastapi.responses import JSONResponse
from starlette.responses import HTMLResponse

from DataBaseManager import db
from DataBaseManager.models import Students as Users
# TODO исправить импорт + спец метод вообще нужны отдельные проверки на тонну всего а делать так просто ужасно, задача уже у турпала, потом поменять
from routers.auth.auntefication import SessionData, get_session_data, create_session_user, backend, cookie
from routers.auth.models import UserAuth

router = APIRouter()
router.prefix = "/auth"

# TODO исправить здесь весь файл + под новый метод
@router.post("/register", response_class=JSONResponse)
async def registerUser(item: UserAuth):
    if db.select(sqlalchemy.select(Users).where(Users.login == item.login)):
        return JSONResponse(content={"result": False, "msg": "A user with this login already exists"}, status_code=200)
    elif not item.login or not item.password:
        return JSONResponse(content={"result": False, "msg": "Login and password fields cannot be empty"},
                            status_code=200)
    response = JSONResponse(content={"result": True, "msg": "ok"}, status_code=200)
    db.execute_commit(sqlalchemy.insert(Users).values(login=item.login, password=item.password))
    user = db.select(sqlalchemy.select(Users).where(Users.login == item.login), db.any_)
    await create_session_user(response, id=user.id, login=item.login)
    return response


@router.post("/login", response_class=JSONResponse)
async def authenticate(item: UserAuth):
    if not item.login or not item.password:
        return JSONResponse(content={"result": False, "msg": "Login and password fields cannot be empty"},
                            status_code=200)
    user = db.select(
        sqlalchemy.select(Users).where(sqlalchemy.and_(Users.login == item.login, Users.password == item.password)),
        db.any_)
    if not user:
        return JSONResponse(content={"result": False, "msg": "The login or password entered is incorrect"},
                            status_code=200)
    else:
        response = JSONResponse(content={"result": True, "msg": "ok"}, status_code=200)
        await create_session_user(response, id=user.id, login=item.login)
    return response


@router.post("/logout")
async def del_session(response: Response, session_id: UUID = Depends(cookie)):
    await backend.delete(session_id)
    cookie.delete_from_response(response)
    return "ok"


@router.get("/")
async def home():
    print(open("templates/login.html", encoding='utf-8').read())
    return HTMLResponse(content=open("templates/login.html", encoding="utf-8").read())
