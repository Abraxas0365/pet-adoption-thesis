from app.schemas.pet import PetSchema

from app.features.dictionaries import (
    SPECIES,
    SEX,
    SIZE,
    COLORS,
    TEMPERAMENTS,
    ACTIVITY_LEVEL,
    BREEDS,
    BREEDS_BY_SPECIES,
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

    # Breed is encoded only within its matching species.
    species = pet.species.strip().lower() if pet.species else ""
    breed = pet.breed.strip().lower() if pet.breed else None
    valid_breeds = BREEDS_BY_SPECIES.get(species, [])
    vector.extend(
        one_hot(breed if breed in valid_breeds else None, BREEDS)
    )

    return vector