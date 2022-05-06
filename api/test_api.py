from api.api import send_boxes, AnnotationsRequest, app
from fastapi.testclient import TestClient


def test_bounds():
    width = 500
    height = 500
    pages = 3
    res = send_boxes(AnnotationsRequest(width=width, height=height, pages=pages))
    assert len(res.annotations) == pages
    for page in res.annotations:
        for token in page:
            assert token.top > 0 and token.top < height
            assert token.left > 0 and token.left < width
            assert token.width < width
            assert token.height < height
            assert token.id != ""


client = TestClient(app)


def test_req():
    pages = 3
    response = client.post(
        "/api/annotations", json={"pages": pages, "width": 500, "height": 500}
    )
    assert response.status_code == 200
    res = response.json()
    assert len(res["annotations"]) == pages
