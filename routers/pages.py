from http.server import HTTPServer
from uuid import UUID

import sqlalchemy
import uvicorn
from fastapi import FastAPI, Depends, Response, APIRouter
from fastapi.responses import JSONResponse
from starlette.responses import HTMLResponse

from DataBaseManager import db
from DataBaseManager.models import Students as Users
from routers.auth.auntefication import SessionData, get_session_data, create_session_user, backend, cookie
from routers.auth.schems import UserAuth


router = APIRouter()

@router.get("/login")
async def home():
    return HTMLResponse(content=open("templates/login_page.html", encoding="utf-8").read())
