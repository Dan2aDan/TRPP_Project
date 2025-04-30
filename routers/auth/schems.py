from pydantic import BaseModel
from typing import Optional, Union


class UserAuth(BaseModel):
    login: str
    password: str


class Response(BaseModel):
    msg: str
    result: Optional[Union[dict, list, str, int, bool]] = None
    code: int


class SessionData(BaseModel):
    login: str
    id: int
    state: bool


class CurrentUserInfo(BaseModel):
    id: int
    login: str
    is_teacher: bool
    bio: Optional[str] = None



