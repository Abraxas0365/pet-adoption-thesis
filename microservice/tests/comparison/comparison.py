
"""
Standalone comparison of PawMatch similarity algorithms.

Run from the microservice directory:
    python -m test.comparison.comparison

Reuses existing PawMatch encoders, dictionaries, and algorithms.
Data loading and vector encoding are excluded from execution timing.
"""
from __future__ import annotations

import csv
import random
import statistics
import time
from pathlib import Path
from types import SimpleNamespace
from typing import Callable

from app.algorithms.cosine import weighted_cosine_similarity
from app.algorithms.jaccard import jaccard_similarity
from app.algorithms.tversky import tversky_similarity
from app.features.adopter import adopter_to_vector
from app.features.dictionaries import (
    ACTIVITY_LEVEL,
    COLORS,
    SIZE,
    TEMPERAMENTS,
    VECTOR_WEIGHTS,
)
from app.features.pet import pet_to_vector


# --------------------------------------------------
# Configuration
# --------------------------------------------------

HERE = Path(__file__).resolve().parent
DATA_FILE = HERE / "data" / "pet_adoption_synthetic.csv"
RESULTS_DIR = HERE / "results"

TOP_K = 1000
TIMING_REPEATS = 20
RANDOM_SEED = 42

ALGORITHMS: dict[str, Callable] = {
    "weighted_cosine": lambda a, b: weighted_cosine_similarity(
        a, b, VECTOR_WEIGHTS
    ),
    "jaccard": jaccard_similarity,
    "tversky": tversky_similarity,
}

# Only these preferences will be randomly perturbed.
# Add or remove fields depending on the experiment.
PROFILE_FIELDS = {
    "preferred_size": SIZE,
    "preferred_color": COLORS,
    "preferred_temperament": TEMPERAMENTS,
    "preferred_activity_level": ACTIVITY_LEVEL,
}


# --------------------------------------------------
# Adopter test profiles
# --------------------------------------------------

PROFILE_DATA = [
    dict(name="P01_dog_active", preferred_species=["dog"],
         preferred_sex=["male", "female"],
         preferred_size=["medium", "large"],
         preferred_color=["brown", "black"],
         preferred_temperament=["friendly", "playful"],
         preferred_activity_level=["high", "moderate"]),

    dict(name="P02_small_calm_dog", preferred_species=["dog"],
         preferred_sex=["female"], preferred_size=["small"],
         preferred_color=["black", "white"],
         preferred_temperament=["calm", "affectionate"],
         preferred_activity_level=["low"]),

    dict(name="P03_calm_cat", preferred_species=["cat"],
         preferred_sex=["female"], preferred_size=["small", "medium"],
         preferred_color=["gray", "white"],
         preferred_temperament=["calm", "independent"],
         preferred_activity_level=["low"]),

    dict(name="P04_playful_cat", preferred_species=["cat"],
         preferred_sex=["male"], preferred_size=["medium"],
         preferred_color=["orange", "black"],
         preferred_temperament=["playful", "affectionate"],
         preferred_activity_level=["moderate", "high"]),

    dict(name="P05_gentle_rabbit", preferred_species=["rabbit"],
         preferred_sex=["female"], preferred_size=["small"],
         preferred_color=["white", "brown"],
         preferred_temperament=["calm", "shy"],
         preferred_activity_level=["low"]),

    dict(name="P06_active_bird", preferred_species=["bird"],
         preferred_sex=["male", "female"], preferred_size=["small"],
         preferred_color=["white", "gray"],
         preferred_temperament=["energetic", "playful"],
         preferred_activity_level=["high"]),

    dict(name="P07_any_species", preferred_species=["dog", "cat"],
         preferred_sex=["male", "female"],
         preferred_size=["small", "medium"],
         preferred_color=["black", "white", "brown"],
         preferred_temperament=["friendly", "affectionate"],
         preferred_activity_level=["moderate"]),

    dict(name="P08_large_dog", preferred_species=["dog"],
         preferred_sex=["male"], preferred_size=["large"],
         preferred_color=["brown", "white"],
         preferred_temperament=["protective", "patient"],
         preferred_activity_level=["moderate", "high"]),

    dict(name="P09_independent_cat", preferred_species=["cat"],
         preferred_sex=["male", "female"],
         preferred_size=["small", "medium"],
         preferred_color=["black", "gray"],
         preferred_temperament=["independent", "shy"],
         preferred_activity_level=["low", "moderate"]),

    dict(name="P10_friendly_any", preferred_species=["dog", "rabbit"],
         preferred_sex=["female"],
         preferred_size=["small", "medium"],
         preferred_color=["white", "cream", "brown"],
         preferred_temperament=["friendly", "patient"],
         preferred_activity_level=["low", "moderate"]),
]


# --------------------------------------------------
# Data preparation
# --------------------------------------------------

def make_profile(data: dict) -> SimpleNamespace:
    """Create the object expected by the existing adopter encoder."""
    return SimpleNamespace(
        **{key: value for key, value in data.items() if key != "name"}
    )


def load_pets(path: Path) -> list[dict]:
    """Load pets and encode them using the existing application encoder."""
    if not path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {path}\n"
            "Place pet_adoption_synthetic.csv in test/comparison/data/."
        )

    pets = []

    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)

        required = {
            "PetID", "PetType", "Color", "Size",
            "Sex", "ActivityLevel", "Temperament",
        }

        missing = required - set(reader.fieldnames or [])
        if missing:
            raise ValueError(
                f"CSV is missing required columns: {', '.join(sorted(missing))}"
            )

        for row in reader:
            temperament = [
                item.strip().lower()
                for item in (row.get("Temperament") or "").split(";")
                if item.strip()
            ]

            pet = SimpleNamespace(
                species=(row.get("PetType") or "").strip().lower(),
                sex=(row.get("Sex") or "").strip().lower(),
                size=(row.get("Size") or "").strip().lower(),
                color=(row.get("Color") or "").strip().lower(),
                temperament=temperament,
                activity_level=(
                    row.get("ActivityLevel") or ""
                ).strip().lower(),
            )

            pets.append({
                "pet_id": str(row["PetID"]),
                "vector": pet_to_vector(pet),
            })

    if not pets:
        raise ValueError("The dataset contains no pet records.")

    return pets


def prepare_profiles() -> list[tuple[str, dict, list[float]]]:
    """Encode adopter profiles before benchmarking."""
    prepared = []

    for data in PROFILE_DATA:
        name = data["name"]
        vector = adopter_to_vector(make_profile(data))

        if len(vector) != len(VECTOR_WEIGHTS):
            raise ValueError(
                f"Vector length mismatch for {name}: "
                f"adopter={len(vector)}, weights={len(VECTOR_WEIGHTS)}"
            )

        prepared.append((name, data, vector))

    return prepared


# --------------------------------------------------
# Similarity scoring and ranking
# --------------------------------------------------

def score_all(
    profile_vector: list[float],
    pet_vectors: list[list[float]],
) -> dict[str, list[float]]:
    """Score every pet with each algorithm."""
    return {
        name: [
            function(profile_vector, pet_vector)
            for pet_vector in pet_vectors
        ]
        for name, function in ALGORITHMS.items()
    }


def ranked_indices(scores: list[float], pets: list[dict]) -> list[int]:
    """Sort by descending score, then PetID to break ties consistently."""
    return sorted(
        range(len(scores)),
        key=lambda i: (-scores[i], pets[i]["pet_id"]),
    )


def top_k_jaccard(
    ranking_a: list[int],
    ranking_b: list[int],
    k: int = TOP_K,
) -> float:
    """Calculate Jaccard overlap between two top-k recommendation sets."""
    set_a = set(ranking_a[:k])
    set_b = set(ranking_b[:k])
    union = set_a | set_b

    return len(set_a & set_b) / len(union) if union else 1.0


# --------------------------------------------------
# CSV output helper
# --------------------------------------------------

def write_csv(path: Path, fields: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


# --------------------------------------------------
# Baseline rankings
# --------------------------------------------------

def build_rankings(
    prepared_profiles: list[tuple[str, dict, list[float]]],
    pets: list[dict],
    pet_vectors: list[list[float]],
) -> dict[tuple[str, str], list[int]]:
    """Save each profile's baseline ranking for every algorithm."""
    rows = []
    baseline_rankings = {}

    for name, _, profile_vector in prepared_profiles:
        scores_by_algorithm = score_all(profile_vector, pet_vectors)

        for algorithm, scores in scores_by_algorithm.items():
            ranking = ranked_indices(scores, pets)
            baseline_rankings[(name, algorithm)] = ranking

            for rank, index in enumerate(ranking, start=1):
                rows.append({
                    "profile": name,
                    "algorithm": algorithm,
                    "rank": rank,
                    "pet_id": pets[index]["pet_id"],
                    "similarity_score": f"{scores[index]:.10f}",
                    f"is_top_{TOP_K}": int(rank <= TOP_K),
                })

    write_csv(
        RESULTS_DIR / "rankings.csv",
        [
            "profile", "algorithm", "rank", "pet_id",
            "similarity_score", f"is_top_{TOP_K}",
        ],
        rows,
    )

    return baseline_rankings


# --------------------------------------------------
# Execution-time benchmark
# --------------------------------------------------

def benchmark_execution(
    prepared_profiles: list[tuple[str, dict, list[float]]],
    pet_vectors: list[list[float]],
) -> list[dict]:
    """Measure similarity calls only, excluding loading and encoding."""
    rows = []

    for repeat in range(1, TIMING_REPEATS + 1):
        # Rotate algorithm order to reduce systematic order bias.
        names = list(ALGORITHMS)
        offset = (repeat - 1) % len(names)
        names = names[offset:] + names[:offset]

        for name in names:
            function = ALGORITHMS[name]
            comparisons = 0
            start = time.perf_counter()

            for _, _, profile_vector in prepared_profiles:
                for pet_vector in pet_vectors:
                    function(profile_vector, pet_vector)
                    comparisons += 1

            elapsed = time.perf_counter() - start

            rows.append({
                "repeat": repeat,
                "algorithm": name,
                "profiles": len(prepared_profiles),
                "pets": len(pet_vectors),
                "comparisons": comparisons,
                "elapsed_ms": f"{elapsed * 1000:.6f}",
                "comparisons_per_second": (
                    f"{comparisons / elapsed:.2f}" if elapsed else ""
                ),
            })

    write_csv(
        RESULTS_DIR / "execution_times.csv",
        [
            "repeat", "algorithm", "profiles", "pets",
            "comparisons", "elapsed_ms", "comparisons_per_second",
        ],
        rows,
    )

    return rows


def summarize_execution(timing_rows: list[dict]) -> list[dict]:
    summary = []

    for name in ALGORITHMS:
        rows = [r for r in timing_rows if r["algorithm"] == name]
        times = [float(r["elapsed_ms"]) for r in rows]
        throughput = [float(r["comparisons_per_second"]) for r in rows]

        summary.append({
            "algorithm": name,
            "runs": len(times),
            "mean_ms": f"{statistics.mean(times):.6f}",
            "median_ms": f"{statistics.median(times):.6f}",
            "stdev_ms": (
                f"{statistics.stdev(times):.6f}" if len(times) > 1 else "0"
            ),
            "mean_comparisons_per_second": f"{statistics.mean(throughput):.2f}",
        })

    write_csv(
        RESULTS_DIR / "execution_summary.csv",
        [
            "algorithm", "runs", "mean_ms", "median_ms",
            "stdev_ms", "mean_comparisons_per_second",
        ],
        summary,
    )

    return summary


# --------------------------------------------------
# Ranking stability
# --------------------------------------------------

def perturb_profile(
    profile_data: dict,
    field: str,
    rng: random.Random,
) -> dict:
    """Replace one selected preference with a different valid category."""
    changed = {
        key: value[:] if isinstance(value, list) else value
        for key, value in profile_data.items()
    }

    selected = changed[field]
    categories = PROFILE_FIELDS[field]

    if not categories:
        raise ValueError(f"No categories configured for {field}.")

    if not selected:
        changed[field] = [rng.choice(categories)]
        return changed

    alternatives = [item for item in categories if item not in selected]

    if alternatives:
        index = rng.randrange(len(selected))
        selected[index] = rng.choice(alternatives)
    else:
        # If all categories were selected, remove one instead.
        index = rng.randrange(len(selected))
        selected.pop(index)

    changed[field] = list(dict.fromkeys(selected))
    return changed


def evaluate_stability(
    prepared_profiles: list[tuple[str, dict, list[float]]],
    pets: list[dict],
    pet_vectors: list[list[float]],
    baseline_rankings: dict[tuple[str, str], list[int]],
) -> list[dict]:
    rng = random.Random(RANDOM_SEED)
    rows = []

    for profile_name, profile_data, _ in prepared_profiles:
        for field in PROFILE_FIELDS:
            changed_data = perturb_profile(profile_data, field, rng)
            changed_vector = adopter_to_vector(make_profile(changed_data))
            changed_scores = score_all(changed_vector, pet_vectors)

            for algorithm, scores in changed_scores.items():
                changed_ranking = ranked_indices(scores, pets)
                baseline = baseline_rankings[(profile_name, algorithm)]

                rows.append({
                    "profile": profile_name,
                    "algorithm": algorithm,
                    "changed_attribute": field,
                    "top_k": TOP_K,
                    "top_k_jaccard_overlap": f"{top_k_jaccard(baseline, changed_ranking):.6f}",
                })

    write_csv(
        RESULTS_DIR / "ranking_stability.csv",
        [
            "profile", "algorithm", "changed_attribute",
            "top_k", "top_k_jaccard_overlap",
        ],
        rows,
    )

    summary = []

    for algorithm in ALGORITHMS:
        values = [
            float(row["top_k_jaccard_overlap"])
            for row in rows if row["algorithm"] == algorithm
        ]

        summary.append({
            "algorithm": algorithm,
            "profiles": len(prepared_profiles),
            "perturbations_per_profile": len(PROFILE_FIELDS),
            f"mean_overlap_top_{TOP_K}": f"{statistics.mean(values):.6f}",
            f"median_overlap_top_{TOP_K}": f"{statistics.median(values):.6f}",
            "stdev": (
                f"{statistics.stdev(values):.6f}" if len(values) > 1 else "0"
            ),
        })

    write_csv(
        RESULTS_DIR / "stability_summary.csv",
        [
            "algorithm", "profiles", "perturbations_per_profile",
            f"mean_overlap_top_{TOP_K}",
            f"median_overlap_top_{TOP_K}", "stdev",
        ],
        summary,
    )

    return summary


# --------------------------------------------------
# Console output
# --------------------------------------------------

def print_summaries(
    pets_count: int,
    profiles_count: int,
    execution_summary: list[dict],
    stability_summary: list[dict],
) -> None:
    print(f"Loaded {pets_count:,} pets and {profiles_count} adopter profiles.")
    print(f"Timing runs per algorithm: {TIMING_REPEATS}")
    print(f"Top-K: {TOP_K}")
    print(f"Results written to: {RESULTS_DIR}")

    print("\nExecution time (lower is faster):")
    for row in execution_summary:
        print(
            f"  {row['algorithm']:<16} "
            f"mean={row['mean_ms']} ms | median={row['median_ms']} ms"
        )

    print(f"\nRanking stability (top-{TOP_K} overlap; higher means more overlap):")
    for row in stability_summary:
        column = f"mean_overlap_top_{TOP_K}"
        print(f"  {row['algorithm']:<16} mean={row[column]}")


# --------------------------------------------------
# Main
# --------------------------------------------------

def main() -> None:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    pets = load_pets(DATA_FILE)
    pet_vectors = [pet["vector"] for pet in pets]
    profiles = prepare_profiles()

    baseline_rankings = build_rankings(profiles, pets, pet_vectors)

    timing_rows = benchmark_execution(profiles, pet_vectors)
    execution_summary = summarize_execution(timing_rows)

    stability_summary = evaluate_stability(
        profiles, pets, pet_vectors, baseline_rankings
    )

    print_summaries(
        len(pets),
        len(profiles),
        execution_summary,
        stability_summary,
    )


if __name__ == "__main__":
    main()
