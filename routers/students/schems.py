from pydantic import BaseModel
from typing import List

class StudentAdd(BaseModel):
    login: str
    password: str


class StudentResponse(BaseModel):
    id: int
    login: str
    bio: str
    teacher_id: int
    password: str


class StudentsListResponse(BaseModel):
    students: List[StudentResponse]
    msg: str
    code: int


class Response(BaseModel):
    class Result(BaseModel):
        login: str
        bio: str

    result: Result | None
    msg: str
    code: int