def one_hot(value: str, categories: list[str]) -> list[int]:
    """
    Example:
    dog -> [1,0]
    cat -> [0,1]
    """

    value = value.lower()

    return [
        1 if value == category else 0
        for category in categories
    ]


def multi_hot(values: list[str], categories: list[str]) -> list[int]:
    """
    Example:
    ["dog","cat"] -> [1,1]
    """

    values = [v.lower() for v in values]

    return [
        1 if category in values else 0
        for category in categories
    ]


# def ordinal(value: str, categories: list[str]) -> float:
#     """
#     Example:
#     small -> 0.0
#     medium -> 0.5
#     large -> 1.0
#     """

#     value = value.lower()

#     if value not in categories:
#         return 0.0

#     index = categories.index(value)

#     if len(categories) == 1:
#         return 1.0

#     return index / (len(categories) - 1)


# def normalize(
#     value: float,
#     min_value: float,
#     max_value: float
# ) -> float:
#     """
#     Normalize to 0-1
#     """

#     if max_value == min_value:
#         return 0.0

#     return (
#         value - min_value
#     ) / (
#         max_value - min_value
#     )