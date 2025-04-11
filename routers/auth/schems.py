from pydantic import BaseModel


class UserAuth(BaseModel):
    login: str
    password: str


class Response(BaseModel):
    class Result(BaseModel):
        login: str
        state: bool

    result: Result | None
    msg: str
    code: int

class SessionData(BaseModel):
    login: str
    id: int
    state: bool



