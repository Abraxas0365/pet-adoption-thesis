# PawMatch algorithm comparison

This experiment is isolated under `microservice/test/comparison/`. It reuses the application's existing algorithms, dictionaries, and feature encoders; it does not start FastAPI or modify the website.

## Setup

1. Copy this `comparison` folder into your existing `microservice/test/` directory.
2. Ensure `data/pet_adoption_synthetic.csv` is in the comparison folder. The supplied bundle already includes it.
3. From the `microservice/` directory, activate your existing virtual environment.
4. Install matplotlib if it is not already installed:

   ```bash
   pip install matplotlib
   ```

## Run the experiment

From the `microservice/` directory:

```bash
python -m tests.comparison.comparison
```

## Generate graphs

```bash
python -m tests.comparison.graph_execution_time
python -m tests.comparison.graph_ranking_stability
```

## Output files

- `results/rankings.csv`: complete ranked pet list for each profile and algorithm.
- `results/execution_times.csv`: raw repeated timing runs.
- `results/execution_summary.csv`: mean, median, and standard deviation of execution time.
- `results/ranking_stability.csv`: top-10 overlap after changing one preference attribute.
- `results/stability_summary.csv`: average ranking-stability summary.
- `results/execution_time.png`: execution-time chart.
- `results/ranking_stability.png`: ranking-stability chart.

## Methodological notes

- The experiment uses 10 illustrative, manually defined adopter profiles. These are test cases, not real adopter observations.
- The CSV's synthetic attributes are simulated. The experiment evaluates algorithm behavior on this dataset, not real-world adoption success.
- Timing excludes CSV loading, vector encoding, and graph creation; it measures similarity scoring for all 10 profiles against all pets. Run on the same machine/environment for a fair comparison.
- Ranking stability is defined as the Jaccard overlap between baseline and perturbed top-10 pet sets, after changing one preference attribute at a time. A higher score means the top-10 set is less sensitive to those changes.
- This experiment does not report MRR because there are no validated adopter-pet relevance labels. `AdoptionLikelihood` is not pair-specific ground truth.
- Weighted Cosine uses the existing `VECTOR_WEIGHTS`. The current Jaccard and Tversky implementations do not apply those feature weights. This is part of the implementations being compared and should be disclosed in the thesis.
- Tversky uses the existing default alpha=0.5 and beta=0.25, so it is asymmetric. The same argument order (adopter vector first, pet vector second) is used throughout.
