from pydantic import BaseModel


class TestData(BaseModel):
    pet: str
    score: float


class TestResponse(BaseModel):
    message: str
    status: str
    service: str
    data: TestData