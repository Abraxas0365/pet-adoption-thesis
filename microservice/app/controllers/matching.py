from app.schemas.adopter import AdopterSchema
from app.schemas.pet import PetSchema
from app.schemas.matching import BatchMatchingRequest
from app.services.matching import (
    calculate_final_scores,
    calculate_match_scores,
    selected_match_score,
)

ALGORITHM_LABELS = {
    "weighted_cosine": "Weighted Cosine",
    "jaccard": "Jaccard",
    "tversky": "Tversky",
}


def match(
    adopter: AdopterSchema,
    pet: PetSchema,
    algorithm: str = "weighted_cosine",
):
    if algorithm not in ALGORITHM_LABELS:
        from fastapi import HTTPException

        raise HTTPException(status_code=422, detail="Unsupported matching algorithm.")

    scores = calculate_match_scores(adopter, pet)
    final_scores = calculate_final_scores(adopter, pet, scores)
    return {
        "pet_id": pet.pet_id,
        "algorithm": algorithm,
        "score_scale": "0_to_1",
        "score": selected_match_score(algorithm, final_scores),
        "scores": scores,
        "final_scores": final_scores,
    }


def match_batch(request: BatchMatchingRequest):
    results = []
    for pet in request.pets:
        scores = calculate_match_scores(request.adopter, pet)
        final_scores = calculate_final_scores(request.adopter, pet, scores)
        results.append(
            {
                "pet_id": pet.pet_id,
                "score": selected_match_score(request.algorithm, final_scores),
                "scores": scores,
                "final_scores": final_scores,
            }
        )

    results.sort(key=lambda result: result["score"], reverse=True)
    return {
        "status": "success",
        "message": (
            "Matches generated successfully."
            if results
            else "No available pets to evaluate."
        ),
        "algorithm": request.algorithm,
        "score_scale": "0_to_1",
        "total": len(results),
        "results": results,
    }