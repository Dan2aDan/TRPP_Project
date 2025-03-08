from uuid import UUID

import sqlalchemy
import uvicorn
from fastapi import FastAPI, Depends, Response
from fastapi.responses import JSONResponse

from DataBaseManager import db
from DataBaseManager.models import Users
from auntefication import SessionData, get_session_data, create_session_user, backend, cookie
from models import UserAuth, UserLogin, CreateGroups

app = FastAPI()


@app.post("/register", response_class=JSONResponse)
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


@app.post("/login", response_class=JSONResponse)
async def authenticate(item: UserLogin):
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


@app.post("/logout")
async def del_session(response: Response, session_id: UUID = Depends(cookie)):
    await backend.delete(session_id)
    cookie.delete_from_response(response)
    return "ok"


@app.get("/", response_class=JSONResponse)
async def index(session_data: SessionData = Depends(get_session_data)):
    # навешивание этих аргументов уже значит проверку
    return session_data.dict()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
