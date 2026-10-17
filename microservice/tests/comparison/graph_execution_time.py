"""Create a bar chart from comparison/results/execution_summary.csv."""
import csv
from pathlib import Path
import matplotlib.pyplot as plt

HERE = Path(__file__).resolve().parent
INPUT = HERE / "results" / "execution_summary.csv"
OUTPUT = HERE / "results" / "execution_time.png"

def main():
    if not INPUT.exists():
        raise FileNotFoundError(f"{INPUT} not found. Run comparison.py first.")
    with INPUT.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    names = [row["algorithm"].replace("_", " ").title() for row in rows]
    means = [float(row["mean_ms"]) for row in rows]
    deviations = [float(row["stdev_ms"]) for row in rows]

    plt.figure(figsize=(8, 5))
    plt.bar(names, means, yerr=deviations, capsize=5)
    plt.ylabel("Elapsed time (milliseconds)")
    plt.xlabel("Similarity algorithm")
    plt.title("Execution Time: 10 Adopter Profiles × All Pet Records")
    plt.tight_layout()
    plt.savefig(OUTPUT, dpi=200)
    print(f"Saved {OUTPUT}")
    plt.show()

if __name__ == "__main__":
    main()
