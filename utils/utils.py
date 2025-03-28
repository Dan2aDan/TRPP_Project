from pydantic import BaseModel
from starlette.responses import JSONResponse


def generate_json(model: BaseModel, **kwargs):

    return JSONResponse(content=model.model_dump(), status_code=model.code, **kwargs)