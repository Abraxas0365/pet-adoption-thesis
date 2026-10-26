SPECIES = [
    "dog",
    "cat",
    "bird",
    "rabbit",
]

SEX = [
    "male",
    "female",
]

SIZE = [
    "small",
    "medium",
    "large",
]

ACTIVITY_LEVEL = [
    "low",
    "moderate",
    "high",
]

VACCINATION_STATUS = [
    "vaccinated",
    "partially_vaccinated",
    "unvaccinated",
]

TEMPERAMENTS = [
    "friendly",
    "playful",
    "calm",
    "affectionate",
    "energetic",
    "independent",
    "protective",
    "shy",
    "aggressive",
    "patient",
]

HOME_TYPE = [
    "house",
    "apartment",
    "condo",
    "other",
]

COLORS = [
    "black",
    "white",
    "brown",
    "gray",
    "orange",
    "cream",
]

BREEDS = [
    'aspin',
    'puspin',
]

FEATURE_WEIGHTS = {
    "species": 10.0,
    "sex": 3.0,
    "size": 6.0,
    "color": 1.0,
    "temperament": 5.5,
    "activity_level": 3.0,
}

SCORE_WEIGHTS = {
    "algorithm": 0.9,
    "age": 0.05,
    "weight": 0.05
}

VECTOR_WEIGHTS = (
    [FEATURE_WEIGHTS["species"]] * len(SPECIES)
    + [FEATURE_WEIGHTS["sex"]] * len(SEX)
    + [FEATURE_WEIGHTS["size"]] * len(SIZE)
    + [FEATURE_WEIGHTS["color"]] * len(COLORS)
    + [FEATURE_WEIGHTS["temperament"]] * len(TEMPERAMENTS)
    + [FEATURE_WEIGHTS["activity_level"]] * len(ACTIVITY_LEVEL)
)