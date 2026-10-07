def range_score(
    value: float,
    minimum: float | None,
    maximum: float | None,
) -> float:
    """
    Calculate how well a value fits within a preferred range.

    Returns:
        1.0 if there is no preference
        1.0 if the value is within the preferred range
        0.0 if the value is outside the preferred range
    """

    # No preference
    if minimum is None and maximum is None:
        return 1.0

    # Below minimum
    if minimum is not None and value < minimum:
        return 0.0

    # Above maximum
    if maximum is not None and value > maximum:
        return 0.0

    # Within range
    return 1.0