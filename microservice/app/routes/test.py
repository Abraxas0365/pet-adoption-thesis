from fastapi import APIRouter

from app.schemas.test import TestResponse, TestData

router = APIRouter(
    prefix = "/test",
    tags = ["Test"],
)

@router.get("/json", response_model=TestResponse)
def test_json():
    return TestResponse(
    message = "Test successful",
        status = "success",
        service = "matching",
        data = TestData(
            pet = "Baldog",
            score = 0.96,
        ),
    )