import unittest

from pydantic import ValidationError

from app.controllers.matching import match_batch
from app.schemas.adopter import AdopterSchema
from app.schemas.matching import BatchMatchingRequest, BatchMatchingResponse
from app.schemas.pet import PetSchema
from app.services.matching import calculate_final_scores, calculate_match_scores


def adopter(**overrides: object) -> AdopterSchema:
    values: dict[str, object] = {
        "preferred_species": [],
        "preferred_sex": [],
        "preferred_size": [],
        "preferred_color": [],
        "preferred_temperament": [],
        "preferred_activity_level": [],
        "preferred_breed": [],
        "preferred_age_min": None,
        "preferred_age_max": None,
        "preferred_weight_min": None,
        "preferred_weight_max": None,
    }
    values.update(overrides)
    return AdopterSchema.model_validate(values)


def pet(
    pet_id: int,
    *,
    species: str | None = "dog",
    breed: str | None = None,
    sex: str | None = "male",
    size: str | None = "small",
    color: str | None = "brown",
    temperament: list[str] | None = None,
    activity_level: str | None = "low",
    age: int | None = 12,
    weight: float | None = 2.0,
) -> PetSchema:
    return PetSchema(
        pet_id=pet_id,
        name=f"Pet {pet_id}",
        species=species,
        breed=breed,
        sex=sex,
        size=size,
        color=color,
        temperament=temperament if temperament is not None else [],
        activity_level=activity_level,
        age=age,
        weight=weight,
    )


class MatchingTests(unittest.TestCase):
    def test_exact_preferences_score_above_mismatched_attributes(self) -> None:
        preferences = adopter(
            preferred_species=["dog"],
            preferred_color=["brown"],
        )
        exact = calculate_match_scores(preferences, pet(1))
        different_color = calculate_match_scores(
            preferences,
            pet(2, color="gray"),
        )

        self.assertGreater(exact["weighted_cosine"], different_color["weighted_cosine"])
        self.assertGreater(exact["jaccard"], different_color["jaccard"])
        self.assertGreater(exact["tversky"], different_color["tversky"])

    def test_unknown_preference_is_omitted_from_comparison(self) -> None:
        preferences = adopter(
            preferred_species=["dog"],
            preferred_color=["ultraviolet"],
            preferred_breed=["unlisted breed"],
        )
        with_unknown_color = calculate_match_scores(preferences, pet(1))
        without_color_preference = calculate_match_scores(
            adopter(preferred_species=["dog"]),
            pet(1),
        )

        self.assertEqual(without_color_preference, with_unknown_color)

    def test_breed_preferences_only_affect_matching_species(self) -> None:
        preferences = adopter(
            preferred_species=["dog"],
            preferred_breed=["Golden Retriever"],
        )
        exact_breed = calculate_match_scores(
            preferences,
            pet(1, breed="golden retriever"),
        )
        different_breed = calculate_match_scores(
            preferences,
            pet(2, breed="poodle"),
        )

        for algorithm in ("weighted_cosine", "jaccard", "tversky"):
            self.assertGreater(exact_breed[algorithm], different_breed[algorithm])

        without_breed_preference = calculate_match_scores(
            adopter(preferred_species=["dog", "cat"]),
            pet(3, species="cat", breed="persian"),
        )
        cat_and_dog_preferences = adopter(
            preferred_species=["dog", "cat"],
            preferred_breed=["Golden Retriever"],
        )
        with_wrong_species_breed_preference = calculate_match_scores(
            cat_and_dog_preferences,
            pet(3, species="cat", breed="persian"),
        )
        with_misclassified_pet_breed = calculate_match_scores(
            cat_and_dog_preferences,
            pet(3, species="cat", breed="golden retriever"),
        )

        self.assertEqual(
            without_breed_preference,
            with_wrong_species_breed_preference,
        )
        self.assertEqual(
            without_breed_preference,
            with_misclassified_pet_breed,
        )

    def test_unspecified_preferences_are_neutral(self) -> None:
        scores = calculate_match_scores(adopter(), pet(1))
        self.assertEqual(
            scores,
            {"weighted_cosine": 1.0, "jaccard": 1.0, "tversky": 1.0},
        )

    def test_missing_attributes_remain_missing_and_range_neutral(self) -> None:
        missing_pet = pet(1, age=None, weight=None, sex=None, color=None)
        validated = PetSchema.model_validate(missing_pet.model_dump())
        preferences = adopter(
            preferred_species=["dog"],
            preferred_sex=["male"],
            preferred_color=["brown"],
            preferred_age_min=6,
            preferred_age_max=18,
            preferred_weight_min=1.0,
            preferred_weight_max=3.0,
        )
        scores = calculate_match_scores(preferences, validated)
        final_scores = calculate_final_scores(preferences, validated, scores)

        self.assertIsNone(validated.age)
        self.assertIsNone(validated.weight)
        self.assertAlmostEqual(final_scores["weighted_cosine"], 1.0)

    def test_ranges_are_compared_in_months_and_kilograms(self) -> None:
        preferences = adopter(
            preferred_species=["dog"],
            preferred_age_min=12,
            preferred_age_max=12,
            preferred_weight_min=2.0,
            preferred_weight_max=2.0,
        )
        in_range_pet = pet(1, age=12, weight=2.0)
        out_of_range_pet = pet(
            2,
            age=13,
            weight=2.0,
        )
        in_range = calculate_final_scores(
            preferences,
            in_range_pet,
            calculate_match_scores(preferences, in_range_pet),
        )
        out_of_age_range = calculate_final_scores(
            preferences,
            out_of_range_pet,
            calculate_match_scores(preferences, out_of_range_pet),
        )

        self.assertAlmostEqual(in_range["weighted_cosine"], 1.0)
        self.assertLess(out_of_age_range["weighted_cosine"], 1.0)

    def test_batch_ranks_using_the_selected_algorithm(self) -> None:
        preferences = adopter(
            preferred_species=["dog"],
            preferred_sex=["male", "female"],
            preferred_size=["small"],
            preferred_color=["brown", "black"],
            preferred_temperament=["friendly", "calm"],
            preferred_activity_level=["low", "high"],
        )
        candidates = [
            pet(
                10,
                species="dog",
                sex="male",
                size="small",
                color="brown",
                temperament=[],
                activity_level="low",
            ),
            pet(
                223,
                species="cat",
                sex="male",
                size="small",
                color="brown",
                temperament=["friendly", "calm"],
                activity_level="low",
            ),
        ]

        cosine_request = BatchMatchingRequest(
            adopter=preferences,
            pets=candidates,
            algorithm="weighted_cosine",
        )
        jaccard_request = BatchMatchingRequest(
            adopter=preferences,
            pets=candidates,
            algorithm="jaccard",
        )
        cosine_results = match_batch(cosine_request)
        jaccard_results = match_batch(jaccard_request)

        BatchMatchingResponse.model_validate(cosine_results)
        BatchMatchingResponse.model_validate(jaccard_results)
        self.assertEqual([r["pet_id"] for r in cosine_results["results"]], [10, 223])
        self.assertEqual([r["pet_id"] for r in jaccard_results["results"]], [223, 10])
        self.assertEqual(cosine_results["algorithm"], "weighted_cosine")
        self.assertEqual(jaccard_results["algorithm"], "jaccard")

    def test_batch_accepts_empty_candidates_and_returns_no_results(self) -> None:
        response = match_batch(
            BatchMatchingRequest(adopter=adopter(), pets=[])
        )

        self.assertEqual(response["total"], 0)
        self.assertEqual(response["results"], [])
        self.assertEqual(response["status"], "success")

    def test_duplicate_pet_ids_and_reversed_ranges_are_rejected(self) -> None:
        with self.assertRaises(ValidationError):
            BatchMatchingRequest(
                adopter=adopter(),
                pets=[pet(1), pet(1)],
            )

        with self.assertRaises(ValidationError):
            adopter(preferred_age_min=12, preferred_age_max=6)

    def test_all_three_existing_algorithms_return_individual_scores(self) -> None:
        scores = calculate_match_scores(
            adopter(preferred_species=["dog"], preferred_sex=["male"]),
            pet(1),
        )

        self.assertEqual(set(scores), {"weighted_cosine", "jaccard", "tversky"})
        self.assertAlmostEqual(scores["weighted_cosine"], 1.0)
        self.assertEqual(scores["jaccard"], 1.0)
        self.assertEqual(scores["tversky"], 1.0)

    def test_similarity_algorithms_return_expected_distinct_values(self) -> None:
        preferences = adopter(
            preferred_species=["dog"],
            preferred_sex=["male", "female"],
            preferred_size=["small"],
            preferred_color=["brown", "black"],
            preferred_temperament=["friendly", "calm"],
            preferred_activity_level=["low", "high"],
        )
        candidate = pet(
            223,
            species="cat",
            sex="male",
            size="small",
            color="brown",
            temperament=["friendly", "calm"],
            activity_level="low",
        )
        scores = calculate_match_scores(preferences, candidate)

        self.assertAlmostEqual(scores["weighted_cosine"], 0.6849495194)
        self.assertAlmostEqual(scores["jaccard"], 0.5454545454)
        self.assertAlmostEqual(scores["tversky"], 0.7272727273)


if __name__ == "__main__":
    unittest.main()
