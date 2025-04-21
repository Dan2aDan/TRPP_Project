from uuid import UUID

import sqlalchemy
import uvicorn
from fastapi import FastAPI, Depends, Response, APIRouter
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from starlette.staticfiles import StaticFiles

from DataBaseManager import db
from DataBaseManager.extends import DBALL
from routers.auth.auntefication import SessionData, get_session_data, create_session_user, backend, cookie, AuthMiddleware
from routers.auth.auth import router as auth_router
from routers.students.students import router as student_router
from routers.lessons.lessons import router as lessons_router
from utils.variable_environment import VarEnv

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=VarEnv.SECRET_KEY)
app.add_middleware(AuthMiddleware)


router = APIRouter()
router.include_router(auth_router, prefix="/auth")
router.include_router(student_router, prefix="/students")
router.include_router(lessons_router, prefix="/lessons")
app.include_router(router, prefix="/api/v0")
app.mount("/templates", StaticFiles(directory="templates"), name="templates")


@app.get("/", response_class=JSONResponse)
async def index():
    # навешивание этих аргументов уже значит проверку
    return RedirectResponse("/templates/login_page.html")


if __name__ == "__main__":
    DBALL().clear_all_data()
    DBALL().create_data()

    uvicorn.run(app, host="0.0.0.0", port=8000)
