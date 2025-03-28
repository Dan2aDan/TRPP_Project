from uuid import UUID

import sqlalchemy
import uvicorn
from fastapi import FastAPI, Depends, Response, APIRouter
from fastapi.responses import JSONResponse

from DataBaseManager import db
from routers.auth.auntefication import SessionData, get_session_data, create_session_user, backend, cookie
from routers.auth.auth import router as auth_router
from routers.pages import router as pages_router

app = FastAPI()
router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(router, prefix="/api", tags=["api"])
app.include_router(pages_router, prefix="/pages")

@app.get("/", response_class=JSONResponse)
async def index(session_data: SessionData = Depends(get_session_data)):
    # навешивание этих аргументов уже значит проверку
    return session_data.dict()



if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
