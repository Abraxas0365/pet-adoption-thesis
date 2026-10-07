import math


def weighted_cosine_similarity(
    a: list[float],
    b: list[float],
    weights: list[float],
) -> float:
    """
    Calculate the weighted cosine similarity between two vectors.

    Returns a value between 0 and 1, where:
        1.0 = completely similar
        0.0 = completely dissimilar
    """

    # Vectors must have the same number of dimensions.
    if len(a) != len(b):
        raise ValueError(
            "Vectors must have the same length."
        )

    # Every vector dimension must have a corresponding weight.
    if len(a) != len(weights):
        raise ValueError(
            "Vectors and weights must have the same length."
        )

    # Prevent negative weights.
    if any(weight < 0 for weight in weights):
        raise ValueError(
            "Weights cannot be negative."
        )

    # Weighted dot product.
    numerator = sum(
        weight * x * y
        for x, y, weight in zip(a, b, weights)
    )

    # Weighted magnitude of vector A.
    magnitude_a = math.sqrt(
        sum(
            weight * x * x
            for x, weight in zip(a, weights)
        )
    )

    # Weighted magnitude of vector B.
    magnitude_b = math.sqrt(
        sum(
            weight * y * y
            for y, weight in zip(b, weights)
        )
    )

    # Avoid division by zero.
    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0

    return numerator / (
        magnitude_a * magnitude_b
    )