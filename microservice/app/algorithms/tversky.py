def tversky_similarity(
    a: list[float],
    b: list[float],
    alpha: float = 0.5,
    beta: float = 0.25
) -> float:

    if len(a) != len(b):
        raise ValueError("Vectors must have the same length.")

    intersection = 0
    a_only = 0
    b_only = 0

    for x, y in zip(a, b):
        if x == 1 and y == 1:
            intersection += 1
        elif x == 1 and y == 0:
            a_only += 1
        elif x == 0 and y == 1:
            b_only += 1

    denominator = (
        intersection
        + alpha * a_only
        + beta * b_only
    )

    if denominator == 0:
        return 1.0

    return intersection / denominator