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
    date: datetime
    teacher: TeacherInfo
    students_count: int
    created_at: datetime


class LessonsListResponse(BaseModel):
    lessons: List[LessonShortResponse]


class LessonDetailResponse(BaseModel):
    id: int
    title: str
    description: str
    date: datetime
    teacher: TeacherInfo
    students: List[StudentInfo]
    created_at: datetime


class LessonCreate(BaseModel):
    title: str
    description: str
    date: datetime
    students: List[int]


class LessonUpdate(BaseModel):
    title: str
    description: str
    date: datetime
    students: List[int]


class ErrorResponse(BaseModel):
    error: str
    message: str
