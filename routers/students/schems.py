from pydantic import BaseModel

class StudentAdd(BaseModel):
    login: str
    password: str
    bio: str