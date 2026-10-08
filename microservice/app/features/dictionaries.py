SPECIES = [
    "dog",
    "cat",
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
    "species": 5.0,
    "sex": 2.0,
    "size": 3.0,
    "color": 1.0,
    "temperament": 4.0,
    "activity_level": 3.0,
}

SCORE_WEIGHTS = {
    "algorithm": 0.8,
    "age": 0.1,
    "weight": 0.1
}

VECTOR_WEIGHTS = (
    [FEATURE_WEIGHTS["species"]] * len(SPECIES)
    + [FEATURE_WEIGHTS["sex"]] * len(SEX)
    + [FEATURE_WEIGHTS["size"]] * len(SIZE)
    + [FEATURE_WEIGHTS["color"]] * len(COLORS)
    + [FEATURE_WEIGHTS["temperament"]] * len(TEMPERAMENTS)
    + [FEATURE_WEIGHTS["activity_level"]] * len(ACTIVITY_LEVEL)
)