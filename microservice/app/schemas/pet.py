from pydantic import BaseModel, Field


class PetSchema(BaseModel):
    pet_id: int | None = Field(default=None, gt=0)
    name: str

    age: int | None = Field(default=None, ge=0)
    sex: str | None = None

    weight: float | None = Field(default=None, ge=0)
    color: str | None = None
    size: str | None = None

    species: str | None = None
    breed: str | None = None

    temperament: list[str] | None = None
    activity_level: str | None = None

    medical_condition: str | None = None
    vaccination_status: str | None = None