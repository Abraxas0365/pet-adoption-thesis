from pydantic import BaseModel, Field


class PetSchema(BaseModel):
    name: str

    age: int = Field(ge=0)
    sex: str

    weight: float = Field(ge=0)
    color: str
    size: str

    species: str
    breed: str

    temperament: list[str]
    activity_level: str

    medical_condition: str
    vaccination_status: str