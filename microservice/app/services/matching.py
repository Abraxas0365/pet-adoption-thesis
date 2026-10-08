from app.schemas.adopter import AdopterSchema
from app.schemas.pet import PetSchema

from app.features.adopter import adopter_to_vector
from app.features.pet import pet_to_vector

from app.algorithms.cosine import weighted_cosine_similarity
from app.algorithms.range import range_score
from app.algorithms.jaccard import jaccard_similarity

from app.features.dictionaries import (
    SCORE_WEIGHTS,
    VECTOR_WEIGHTS,
)


def calculate_match_score(
    adopter: AdopterSchema,
    pet: PetSchema,
) -> float:

    # --------------------------------
    # 1. Convert data into vectors
    # --------------------------------

    adopter_vector = adopter_to_vector(adopter)
    pet_vector = pet_to_vector(pet)

    # --------------------------------
    # 2. Calculate cosine similarity
    # --------------------------------

    cosine_score = weighted_cosine_similarity(
        adopter_vector,
        pet_vector,
        VECTOR_WEIGHTS,
    )

    jaccard_score = jaccard_similarity(
        adopter_vector,
        pet_vector,
    )

    # --------------------------------
    # 3. Calculate range compatibility
    # --------------------------------

    age_score = range_score(
        pet.age,
        adopter.preferred_age_min,
        adopter.preferred_age_max,
    )

    weight_score = range_score(
        pet.weight,
        adopter.preferred_weight_min,
        adopter.preferred_weight_max,
    )

    # --------------------------------
    # 4. Calculate final match score
    # --------------------------------

    cosine_final_score = (
        cosine_score * SCORE_WEIGHTS["algorithm"]
        + age_score * SCORE_WEIGHTS["age"]
        + weight_score * SCORE_WEIGHTS["weight"]
    )

    jaccard_final_score = (
        jaccard_score * SCORE_WEIGHTS["algorithm"]
        + age_score * SCORE_WEIGHTS["age"]
        + weight_score * SCORE_WEIGHTS["weight"]
    )

    final_score = {
        "Weighted Cosine": cosine_final_score,
        "Jaccard": jaccard_final_score,
    }
    return final_score