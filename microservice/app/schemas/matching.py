from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.schemas.adopter import AdopterSchema
from app.schemas.pet import PetSchema

MatchingAlgorithm = Literal["weighted_cosine", "jaccard", "tversky"]


class BatchMatchingRequest(BaseModel):
    adopter: AdopterSchema
    pets: list[PetSchema]
    algorithm: MatchingAlgorithm = "weighted_cosine"

    @model_validator(mode="after")
    def validate_pet_ids(self) -> "BatchMatchingRequest":
        pet_ids = [pet.pet_id for pet in self.pets]
        if any(pet_id is None for pet_id in pet_ids):
            raise ValueError("Every pet in a batch must have an identifier.")
        if len(pet_ids) != len(set(pet_ids)):
            raise ValueError("Pet identifiers must be unique in a batch.")
        return self


class MatchingScores(BaseModel):
    weighted_cosine: float = Field(ge=0, le=1)
    jaccard: float = Field(ge=0, le=1)
    tversky: float = Field(ge=0, le=1)


class BatchMatchingResult(BaseModel):
    pet_id: int = Field(gt=0)
    score: float = Field(ge=0, le=1)
    scores: MatchingScores
    final_scores: MatchingScores


class BatchMatchingResponse(BaseModel):
    status: Literal["success"] = "success"
    message: str
    algorithm: MatchingAlgorithm
    score_scale: Literal["0_to_1"] = "0_to_1"
    total: int = Field(ge=0)
    results: list[BatchMatchingResult]
