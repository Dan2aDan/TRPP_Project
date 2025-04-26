# routers/tasks/schems.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TaskShortResponse(BaseModel):
    id: int
    lesson_id: int
    description: str
    created_at: Optional[str] = None


class TasksListResponse(BaseModel):
    tasks: List[TaskShortResponse]
    msg: str
    code: int


class TaskCreate(BaseModel):
    description: str
    lesson_id: int


class TaskUpdate(BaseModel):
    description: Optional[str] = None


class ResponseTask(BaseModel):
    result: TaskShortResponse
    msg: str
    code: int
