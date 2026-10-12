from pydantic import BaseModel, Field, model_validator


class AdopterSchema(BaseModel):
    preferred_species: list[str] = Field(default_factory=list)
    preferred_sex: list[str] = Field(default_factory=list)

    preferred_age_min: int | None = Field(default=None, ge=0)
    preferred_age_max: int | None = Field(default=None, ge=0)

    preferred_weight_min: float | None = Field(default=None, ge=0)
    preferred_weight_max: float | None = Field(default=None, ge=0)

    preferred_color: list[str] = Field(default_factory=list)
    preferred_size: list[str] = Field(default_factory=list)

    preferred_breed: list[str] = Field(default_factory=list)

    preferred_temperament: list[str] = Field(default_factory=list)
    preferred_activity_level: list[str] = Field(default_factory=list)

    can_handle_medical_conditions: bool = False
    can_handle_special_care: bool = False

    has_other_animals: bool = False
    other_animals: list[str] = Field(default_factory=list)

    home_type: str = "other"

    @model_validator(mode="after")
    def validate_ranges(self) -> "AdopterSchema":
        if (
            self.preferred_age_min is not None
            and self.preferred_age_max is not None
            and self.preferred_age_min > self.preferred_age_max
        ):
            raise ValueError("preferred_age_min must not exceed preferred_age_max")

        if (
            self.preferred_weight_min is not None
            and self.preferred_weight_max is not None
            and self.preferred_weight_min > self.preferred_weight_max
        ):
            raise ValueError(
                "preferred_weight_min must not exceed preferred_weight_max"
            )

        return self