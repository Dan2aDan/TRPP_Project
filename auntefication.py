from ggshield.core.client import create_session
from pydantic import BaseModel
from fastapi import HTTPException, FastAPI, Response, Depends
from uuid import UUID, uuid4

from fastapi_sessions.backends.implementations import InMemoryBackend
from fastapi_sessions.frontends.implementations import SessionCookie, CookieParameters
from utils.variable_environment import VarEnv

class SessionData(BaseModel):
    login: str
    id: int


cookie_params = CookieParameters()

cookie = SessionCookie(
    cookie_name="cookie",
    identifier="general_verifier",
    auto_error=True,
    secret_key=VarEnv.SECRET_KEY,
    cookie_params=cookie_params,
)
backend = InMemoryBackend[UUID, SessionData]()


async def get_session_data(session_id: UUID = Depends(cookie)) -> SessionData:
    session_data = await backend.read(session_id)
    if session_data is None:
        raise HTTPException(status_code=403, detail="Invalid session")
    return session_data

async def create_session_user(response, **session_data) -> SessionData:
    session = uuid4()
    data = SessionData(**session_data)
    await backend.create(session, data)
    cookie.attach_to_response(response, session)
    return data