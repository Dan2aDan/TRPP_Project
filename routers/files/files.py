from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from DataBaseManager.extends import DBALL
from routers.files.schems import FileInfo, ResponseFile, ResponseDeleteFile
from utils.utils import generate_json
from fastapi.responses import FileResponse
import os

router = APIRouter()


@router.post("/file", response_class=JSONResponse, status_code=201)
async def upload_file(
        file: UploadFile = File(...),
        bind_type: str = Form(...),  # "lesson" or "task"
        bind_id: int = Form(...)
):
    if bind_type not in ("lesson", "task"):
        raise HTTPException(status_code=400, detail={"error": "Invalid bind_type"})

    content = await file.read()
    file_record = DBALL().create_file(file.filename, content)

    if bind_type == "lesson":
        DBALL().update_lesson(bind_id, file_id=file_record.id)
    elif bind_type == "task":
        DBALL().update_task(bind_id, file_id=file_record.id)

    return generate_json(ResponseFile.model_validate({
        "result": FileInfo(
            id=file_record.id,
            path=file_record.path,
            uploaded_at=file_record.uploaded_at.isoformat()
        ),
        "msg": "ok",
        "code": 201
    }))


@router.get("/file/{file_id}", response_class=FileResponse)
async def get_file(file_id: int):
    file = DBALL().get_file_by_id(file_id)
    if not file or not os.path.exists(file.path):
        raise HTTPException(status_code=404, detail={"error": "File not found on disk"})

    return FileResponse(
        path=file.path,
        filename=os.path.basename(file.path),
        media_type="application/octet-stream"
    )


@router.delete("/file/{file_id}", response_class=JSONResponse)
async def delete_file(file_id: int):
    # Открепление от уроков
    lessons = DBALL().get_all_lessons()
    print(lessons)
    for lesson in lessons:
        if lesson.file_id == file_id:
            DBALL().update_lesson(lesson.id, file_id=None)

    # Открепление от задач
    tasks = DBALL().get_all_tasks()
    for task in tasks:
        if task.file_id == file_id:
            DBALL().update_task(task.id, file_id=None)

    success = DBALL().delete_file(file_id)
    if not success:
        raise HTTPException(status_code=500, detail={"error": "Failed to delete file"})

    return generate_json(ResponseDeleteFile.model_validate({
        "message": "File deleted successfully",
        "code": 200
    }))
