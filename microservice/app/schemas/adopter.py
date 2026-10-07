from pydantic import BaseModel, Field


class AdopterSchema(BaseModel):
    preferred_species: list[str]
    preferred_sex: list[str]

    preferred_age_min: int | None = Field(default=None, ge=0)
    preferred_age_max: int | None = Field(default=None, ge=0)

    preferred_weight_min: float | None = Field(default=None, ge=0)
    preferred_weight_max: float | None = Field(default=None, ge=0)

    preferred_color: list[str]
    preferred_size: list[str]

    preferred_breed: list[str]

    preferred_temperament: list[str]
    preferred_activity_level: list[str]

    can_handle_medical_conditions: bool
    can_handle_special_care: bool

    has_other_animals: bool
    other_animals: list[str]

    home_type: str