from app.schemas.adopter import AdopterSchema
from app.schemas.pet import PetSchema

from app.services.matching import calculate_match_score


def match(
    adopter: AdopterSchema,
    pet: PetSchema,
):
    score = calculate_match_score(
        adopter,
        pet,
    )

    return {
        "score": score,
    }