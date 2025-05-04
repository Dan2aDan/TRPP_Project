# routers/tasks/schems.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TaskBigResponse(BaseModel):
    id: int
    lesson_id: int
    description: str
    created_at: Optional[str] = None
    test: Optional[str] = None
    text: Optional[str] = None
    result: Optional[str] = None


class TaskShortResponse(BaseModel):
    id: int
    lesson_id: int
    description: str
    created_at: Optional[str] = None
    test: str


class TasksListResponse(BaseModel):
    tasks: List[TaskShortResponse]
    msg: str
    code: int


class TaskCreate(BaseModel):
    description: str
    lesson_id: int
    text_program: str
    test: str


class TaskUpdate(BaseModel):
    description: Optional[str] = None


class ResponseTask(BaseModel):
    result: TaskShortResponse | TaskBigResponse
    msg: str
    code: int
