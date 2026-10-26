import math
from typing import Literal

from app.algorithms.cosine import weighted_cosine_similarity
from app.algorithms.jaccard import jaccard_similarity
from app.algorithms.range import range_score
from app.algorithms.tversky import tversky_similarity
from app.features.adopter import adopter_to_vector
from app.features.dictionaries import (
    ACTIVITY_LEVEL,
    BREEDS,
    BREEDS_BY_SPECIES,
    COLORS,
    SCORE_WEIGHTS,
    SEX,
    SIZE,
    SPECIES,
    TEMPERAMENTS,
    VECTOR_WEIGHTS,
)
from app.features.pet import pet_to_vector
from app.schemas.adopter import AdopterSchema
from app.schemas.pet import PetSchema

Algorithm = Literal["weighted_cosine", "jaccard", "tversky"]

FEATURE_GROUPS = (
    ("preferred_species", "species", SPECIES, False),
    ("preferred_sex", "sex", SEX, False),
    ("preferred_size", "size", SIZE, False),
    ("preferred_color", "color", COLORS, False),
    ("preferred_temperament", "temperament", TEMPERAMENTS, True),
    ("preferred_activity_level", "activity_level", ACTIVITY_LEVEL, False),
    ("preferred_breed", "breed", BREEDS, False),
)


def calculate_match_scores(
    adopter: AdopterSchema,
    pet: PetSchema,
) -> dict[str, float]:
    adopter_vector = adopter_to_vector(adopter)
    pet_vector = pet_to_vector(pet)
    comparable_indices: list[int] = []
    offset = 0

    for preference_field, pet_field, categories, is_multi in FEATURE_GROUPS:
        width = len(categories)
        requested_values = getattr(adopter, preference_field)
        pet_value = getattr(pet, pet_field)

        if preference_field == "preferred_breed":
            pet_species = pet.species.strip().lower() if pet.species else ""
            species_breeds = BREEDS_BY_SPECIES.get(pet_species, [])
            requested_categories = {
                value.strip().lower()
                for value in requested_values
                if value.strip().lower() in species_breeds
            }
            pet_is_known = (
                isinstance(pet_value, str)
                and pet_value.strip().lower() in species_breeds
            )
        else:
            requested_categories = {
                value.strip().lower()
                for value in requested_values
                if value.strip().lower() in categories
            }

            if is_multi:
                pet_is_known = pet_value is not None and (
                    not pet_value
                    or any(
                        value.strip().lower() in categories
                        for value in pet_value
                    )
                )
            else:
                pet_is_known = (
                    isinstance(pet_value, str)
                    and pet_value.strip().lower() in categories
                )

        if requested_categories and pet_is_known:
            comparable_indices.extend(range(offset, offset + width))

        offset += width

    if comparable_indices:
        adopter_vector = [adopter_vector[index] for index in comparable_indices]
        pet_vector = [pet_vector[index] for index in comparable_indices]
        weights = [VECTOR_WEIGHTS[index] for index in comparable_indices]
        scores = {
            "weighted_cosine": weighted_cosine_similarity(
                adopter_vector,
                pet_vector,
                weights,
            ),
            "jaccard": jaccard_similarity(adopter_vector, pet_vector),
            "tversky": tversky_similarity(adopter_vector, pet_vector),
        }
    else:
        # No shared, specified feature is not evidence of incompatibility.
        scores = {
            "weighted_cosine": 1.0,
            "jaccard": 1.0,
            "tversky": 1.0,
        }

    for key, value in scores.items():
        if not math.isfinite(value) or value < -1e-12 or value > 1.0 + 1e-12:
            raise ValueError(f"{key} produced an invalid similarity score.")

    return {
        key: min(1.0, max(0.0, value))
        for key, value in scores.items()
    }


def calculate_final_scores(
    adopter: AdopterSchema,
    pet: PetSchema,
    scores: dict[str, float],
) -> dict[str, float]:
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

    return {
        algorithm: (
            score * SCORE_WEIGHTS["algorithm"]
            + age_score * SCORE_WEIGHTS["age"]
            + weight_score * SCORE_WEIGHTS["weight"]
        )
        for algorithm, score in scores.items()
    }


def calculate_match_score(
    adopter: AdopterSchema,
    pet: PetSchema,
) -> dict[str, float]:
    scores = calculate_match_scores(adopter, pet)
    return calculate_final_scores(adopter, pet, scores)


def selected_match_score(
    algorithm: Algorithm,
    final_scores: dict[str, float],
) -> float:
    score = final_scores[algorithm]
    if not math.isfinite(score) or not 0.0 <= score <= 1.0:
        raise ValueError("The selected algorithm produced an invalid final score.")
    return score
