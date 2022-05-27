#!/usr/bin/env python3
import fastapi
from pydantic import BaseModel
import random
import uuid

app = fastapi.FastAPI()

ANNOTATION_TYPES = ["TEXTBOX", "RADIOBOX", "CHECKBOX"]


class Bounds(BaseModel):
    id: str
    type: str
    top: float
    left: float
    width: float
    height: float


class AnnotationsResponse(BaseModel):
    annotations: list[list[Bounds]]
    labelRelations: dict[str, str]
    groupRelations: dict[str, list[str]]


class Annotation(BaseModel):
    id: str
    type: str
    top: float
    left: float
    width: float
    height: float
    backgroundColor: str
    page: int
    corrected: bool


class AnnotationsRequest(BaseModel):
    pages: int
    width: int
    height: int
    annotations: dict[str, Bounds]


def random_annotation(page: int, height: int, type=None) -> Bounds:
    return Bounds(
        id=str(uuid.uuid4()),
        top=random.randint(5, 100) + (page * height),
        left=random.randint(5, 300),
        width=random.randint(10, 50),
        height=random.randint(10, 50),
        type=random.choice(ANNOTATION_TYPES) if not type else type,
    )


@app.post("/annotations")
def send_boxes(req: AnnotationsRequest) -> AnnotationsResponse:
    # If you want to insert a model into this code, change the body
    # of this function to return a JSON with the same structure but
    # different text!
    labelRelations: dict[str, str] = {}
    groupRelations: dict[str, list[str]] = {}
    raw_annotations = [
        [random_annotation(page, req.height) for _ in range(10)]
        for page in range(req.pages)
    ]
    annotations = []
    for page_num, page in enumerate(raw_annotations):
        new_annotations = []

        for annotation in page:
            new_annotations.append(annotation)

        for _ in range(3):
            make_label = random.choice(new_annotations)
            to = random_annotation(page_num, req.height, "LABEL")
            new_annotations.append(to)
            labelRelations[to.id] = make_label.id

        annotations.append(new_annotations)

    return AnnotationsResponse(
        annotations=annotations,
        labelRelations=labelRelations,
        groupRelations=groupRelations,
    )
