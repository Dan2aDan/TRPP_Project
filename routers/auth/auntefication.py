from typing import Any, Coroutine

from fastapi_sessions.session_verifier import SessionVerifier
from ggshield.core.client import create_session
from pydantic import BaseModel
from fastapi import HTTPException, FastAPI, Response, Depends, Request
from uuid import UUID, uuid4

from fastapi_sessions.backends.implementations import InMemoryBackend
from fastapi_sessions.frontends.implementations import SessionCookie, CookieParameters
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import RedirectResponse

from utils.variable_environment import VarEnv

from routers.auth.schems import SessionData




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
        # return RedirectResponse('/')
        raise HTTPException(status_code=403, detail="Invalid session")
    return session_data


async def create_session_user(response, **session_data) -> SessionData:
    session = uuid4()
    data = SessionData(**session_data)
    await backend.create(session, data)
    cookie.attach_to_response(response, session)
    return data


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Пути, которые не требуют авторизации
        public_paths = ["/templates/login_page.html", "/templates/assets", "/api/v0/auth"]
        if any(request.url.path.startswith(path) for path in public_paths):
            return await call_next(request)
        try:
            session_id = cookie(request)
            if session_id is None:
                raise ValueError("Session ID not found in cookie")
            session_data = await backend.read(session_id)
        except Exception as e:
            print(f"Auth error: {e}")
            return RedirectResponse('/templates/login_page.html')

        if session_data is None:
            return RedirectResponse('/templates/login_page.html')

            # Сохраняем session_data в request.state
        request.state.session_data = session_data
        return await call_next(request)
