"""
Generate synthetic PawMatch attributes for the Kaggle pet-adoption dataset.

Usage:
    python generate_synthetic_data.py
    python generate_synthetic_data.py input.csv output.csv

The original file is read but never modified. Existing columns are preserved.
Only missing attributes are generated.
"""
import sys
from pathlib import Path

import pandas as pd
import numpy as np

SEED = 42

# PawMatch attribute dictionaries
SEX = ["male", "female"]

ACTIVITY_LEVEL = ["low", "moderate", "high"]

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

# Species is already represented by the source column "PetType".
# Breed, Color, and Size are also already present, so this script preserves them.
# HOME_TYPE describes an adopter's home, not an animal, so it should belong
# in a separate synthetic adopter dataset rather than this animal dataset.

def generate_dataset(input_csv: str, output_csv: str) -> None:
    rng = np.random.default_rng(SEED)
    df = pd.read_csv(input_csv)

    # Map source fields rather than randomly replacing existing information.
    if "Sex" not in df.columns:
        df["Sex"] = rng.choice(SEX, size=len(df))

    if "ActivityLevel" not in df.columns:
        # Synthetic values only; these are not observed animal characteristics.
        df["ActivityLevel"] = rng.choice(
            ACTIVITY_LEVEL,
            size=len(df),
            p=[0.30, 0.45, 0.25],
        )

    if "Temperament" not in df.columns:
        # Store multiple temperament labels as a semicolon-separated string.
        temperament_values = []
        for _ in range(len(df)):
            count = int(rng.integers(1, 4))  # 1 to 3 temperaments
            chosen = rng.choice(TEMPERAMENTS, size=count, replace=False)
            temperament_values.append(";".join(chosen.tolist()))
        df["Temperament"] = temperament_values

    # Derive a compatible label from the existing numeric Vaccinated field,
    # if present. This is a mapping, not a new random observation.
    if "VaccinationStatus" not in df.columns and "Vaccinated" in df.columns:
        df["VaccinationStatus"] = df["Vaccinated"].map(
            {1: "vaccinated", 0: "unvaccinated"}
        ).fillna("unknown")

    # Preserve the original column order and append generated fields.
    output_path = Path(output_csv)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)

    generated = [
        column for column in
        ["Sex", "ActivityLevel", "Temperament", "VaccinationStatus"]
        if column in df.columns
    ]
    print(f"Read {len(df)} rows from: {input_csv}")
    print(f"Saved synthetic dataset to: {output_path}")
    print(f"Columns available: {', '.join(df.columns)}")
    print(
        "Synthetic columns added or available: "
        + (", ".join(generated) if generated else "none")
    )
    print(f"Random seed: {SEED}")
    print("Reminder: generated attributes are simulated, not real animal records.")

if __name__ == "__main__":
    default_input = Path(__file__).resolve().parent / "pet_adoption_data(1).csv"
    default_output = Path(__file__).resolve().parent / "pet_adoption_synthetic.csv"

    input_csv = sys.argv[1] if len(sys.argv) > 1 else str(default_input)
    output_csv = sys.argv[2] if len(sys.argv) > 2 else str(default_output)
    generate_dataset(input_csv, output_csv)
