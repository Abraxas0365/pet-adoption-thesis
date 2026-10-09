def jaccard_similarity(
    a: list[float],
    b: list[float],
) -> float:

    if len(a) != len(b):
        raise ValueError(
            "Vectors must have the same length."
        )

    intersection = 0
    union = 0

    for x, y in zip(a, b):
        if x == 1 and y == 1:
            intersection += 1

        if x == 1 or y == 1:
            union += 1

    if union == 0:
        return 0.0

    return intersection / union