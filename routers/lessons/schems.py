from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TeacherInfo(BaseModel):
    id: int
    name: str


class StudentInfo(BaseModel):
    id: int
    full_name: str


class LessonShortResponse(BaseModel):
    id: int
    title: str
    description: str
    teacher: TeacherInfo
    created_at: str


class LessonsListResponse(BaseModel):
    lessons: List[LessonShortResponse]
    msg: str
    code: int


class LessonDetailResponse(BaseModel):
    id: int
    title: str
    description: str
    teacher: TeacherInfo
    students: List[StudentInfo]
    created_at: str


class LessonCreate(BaseModel):
    file_id: int | None
    title: str
    description: str


class LessonUpdate(BaseModel):
    file_id: int | None
    title: str | None
    description: str | None



class ResponseLesson(BaseModel):
    result: LessonShortResponse
    msg: str
    code: int


class LongResponseLesson(BaseModel):
    result: LessonDetailResponse
    msg: str
    code: int
