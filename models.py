from pydantic import BaseModel


class UserAuth(BaseModel):
    login: str
    password: str


class UserLogin(BaseModel):
    login: str
    password: str


class CreateGroups(BaseModel):
    name: str
