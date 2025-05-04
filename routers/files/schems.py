from pydantic import BaseModel


class FileInfo(BaseModel):
    id: int
    path: str
    uploaded_at: str


class ResponseFile(BaseModel):
    result: FileInfo
    msg: str
    code: int


class ResponseDeleteFile(BaseModel):
    message: str
    code: int
