from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TeacherInfo(BaseModel):
    id: int
    name: str


class StudentInfo(BaseModel):
    id: int
    full_name: str


class StudentLessonResponse(BaseModel):
    id: int
    title: str
    description: str
    teacher: TeacherInfo
    created_at: str
    status: str  # completed, in_progress, not_started


class StudentLessonsResponse(BaseModel):
    result: List[StudentLessonResponse]
    msg: str
    code: int


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
    file_id: int | None = None

class LessonCreate(BaseModel):
    title: str
    description: str


class LessonUpdate(BaseModel):
    description: str


class ResponseLesson(BaseModel):
    result: LessonShortResponse
    msg: str
    code: int


class LongResponseLesson(BaseModel):
    result: LessonDetailResponse
    msg: str
    code: int


class LessonDependencyRequest(BaseModel):
    lesson_id: int
    student_ids: List[int]


class LessonResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    teacher_id: int
    file_id: int
    status: Optional[str] = None  # completed, in_progress, not_started


class LessonStatusResponse(BaseModel):
    lesson_id: int
    status: str
    message: str


class TaskStatusResponse(BaseModel):
    task_id: int
    status: str
    message: str
