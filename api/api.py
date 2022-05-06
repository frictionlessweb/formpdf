#!/usr/bin/env python3
import fastapi
from pydantic import BaseModel
import random
import uuid

app = fastapi.FastAPI()

ANNOTATION_TYPES = ["TEXTBOX", "RADIOBOX", "CHECKBOX", "LABEL", "GROUP", "GROUP_LABEL"]


class Bounds(BaseModel):
    id: str
    type: str
    top: float
    left: float
    width: float
    height: float


class AnnotationsResponse(BaseModel):
    annotations: list[list[Bounds]]


class AnnotationsRequest(BaseModel):
    pages: int
    width: int
    height: int


@app.post("/api/annotations")
def send_boxes(req: AnnotationsRequest) -> AnnotationsResponse:
    return AnnotationsResponse(
        annotations=[
            [
                Bounds(
                    id=str(uuid.uuid4()),
                    top=random.randint(5, 100),
                    left=random.randint(5, 300),
                    width=random.randint(10, 50),
                    height=random.randint(10, 50),
                    type=random.choice(ANNOTATION_TYPES),
                )
                for _ in range(random.randint(20, 50))
            ]
            for _ in range(req.pages)
        ]
    )
