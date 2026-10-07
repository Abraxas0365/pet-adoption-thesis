from app.schemas.pet import PetSchema

from app.features.dictionaries import (
    SPECIES,
    SEX,
    SIZE,
    COLORS,
    TEMPERAMENTS,
    ACTIVITY_LEVEL,
)

from app.features.encoding_functions import *


def pet_to_vector(pet: PetSchema) -> list[float]:
    vector = []

    # Species
    vector.extend(
        one_hot(pet.species, SPECIES)
    )

    # Sex
    vector.extend(
        one_hot(pet.sex, SEX)
    )

    # Size
    vector.extend(
        one_hot(pet.size, SIZE)
    )

    # Color
    vector.extend(
        one_hot(pet.color, COLORS)
    )

    # Temperament
    vector.extend(
        multi_hot(pet.temperament, TEMPERAMENTS)
    )

    # Activity level
    vector.extend(
        one_hot(pet.activity_level, ACTIVITY_LEVEL)
    )

    return vector