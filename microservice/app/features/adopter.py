from app.schemas.adopter import AdopterSchema

from app.features.dictionaries import (
    SPECIES,
    SEX,
    SIZE,
    COLORS,
    TEMPERAMENTS,
    ACTIVITY_LEVEL,
)

from app.features.encoding_functions import *


def adopter_to_vector(adopter: AdopterSchema) -> list[float]:
    vector = []

    # Preferred species
    vector.extend(
        multi_hot(adopter.preferred_species, SPECIES)
    )

    # Preferred sex
    vector.extend(
        multi_hot(adopter.preferred_sex, SEX)
    )

    # Preferred size
    vector.extend(
        multi_hot(adopter.preferred_size, SIZE)
    )

    # Preferred color
    vector.extend(
        multi_hot(adopter.preferred_color, COLORS)
    )

    # Preferred temperament
    vector.extend(
        multi_hot(
            adopter.preferred_temperament,
            TEMPERAMENTS,
        )
    )

    # Preferred activity level
    vector.extend(
        multi_hot(
            adopter.preferred_activity_level,
            ACTIVITY_LEVEL,
        )
    )

    return vector