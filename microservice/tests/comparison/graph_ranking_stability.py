"""Create a bar chart from comparison/results/stability_summary.csv."""
import csv
from pathlib import Path
import matplotlib.pyplot as plt

HERE = Path(__file__).resolve().parent
INPUT = HERE / "results" / "stability_summary.csv"
OUTPUT = HERE / "results" / "ranking_stability.png"

def main():
    if not INPUT.exists():
        raise FileNotFoundError(f"{INPUT} not found. Run comparison.py first.")
    with INPUT.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    names = [row["algorithm"].replace("_", " ").title() for row in rows]
    means = [float(row["mean_top_10_jaccard_overlap"]) for row in rows]
    deviations = [float(row["stdev"]) for row in rows]

    plt.figure(figsize=(8, 5))
    plt.bar(names, means, yerr=deviations, capsize=5)
    plt.ylim(0, 1)
    plt.ylabel("Mean top-10 Jaccard overlap (0–1)")
    plt.xlabel("Similarity algorithm")
    plt.title("Ranking Stability Under Single-Preference Changes")
    plt.tight_layout()
    plt.savefig(OUTPUT, dpi=200)
    print(f"Saved {OUTPUT}")
    plt.show()

if __name__ == "__main__":
    main()
