from pydantic import BaseModel

class FileResponse(BaseModel):
    id: int
    path: str
    uploaded_at: str


class ResponseFile(BaseModel):
    result: FileResponse
    msg: str
    code: int


class ResponseDeleteFile(BaseModel):
    message: str
    code: int
