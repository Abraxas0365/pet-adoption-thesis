import type { MatchPreferences, MatchingResponse, MatchingScoreBreakdown } from "@/types/match";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";



export type MatchingAdopterPayload = Omit<
  MatchPreferences,
  "preferred_breed"
> & {
  preferred_breed: string[];
};

function normalizeArray(value: string[] | undefined): string[] {
  return (value ?? [])
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeBreed(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function isScoreBreakdown(value: unknown): value is MatchingScoreBreakdown {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (["weighted_cosine", "jaccard", "tversky"] as const).every(
    (key) => {
      const score = (value as Record<string, unknown>)[key];
      return (
        typeof score === "number"
        && Number.isFinite(score)
        && score >= 0
        && score <= 1
      );
    },
  );
}

export function toMatchingPayload(
  preferences: MatchPreferences,
): MatchingAdopterPayload {
  return {
    preferred_species: normalizeArray(preferences.preferred_species),
    preferred_sex: normalizeArray(preferences.preferred_sex),
    preferred_size: normalizeArray(preferences.preferred_size),
    preferred_color: normalizeArray(preferences.preferred_color),
    preferred_temperament: normalizeArray(preferences.preferred_temperament),
    preferred_activity_level: normalizeArray(
      preferences.preferred_activity_level,
    ),
    preferred_age_min: preferences.preferred_age_min,
    preferred_age_max: preferences.preferred_age_max,
    preferred_weight_min: preferences.preferred_weight_min,
    preferred_weight_max: preferences.preferred_weight_max,
    preferred_breed: normalizeBreed(preferences.preferred_breed),
    home_type: preferences.home_type,
    has_other_animals: preferences.has_other_animals,
    other_animals: normalizeArray(preferences.other_animals),
    can_handle_medical_conditions:
      preferences.can_handle_medical_conditions,
    can_handle_special_care: preferences.can_handle_special_care,
  };
}

export async function submitMatchRequest(
  preferences: MatchPreferences,
): Promise<MatchingResponse> {
  const response = await fetch(`${API_URL}/api/matching`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      adopter: toMatchingPayload(preferences),
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | MatchingResponse
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.message || "Unable to find matches right now. Please try again.",
    );
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("The matching service returned an invalid response.");
  }

  if (
    payload.status !== "success"
    || !["weighted_cosine", "jaccard", "tversky"].includes(payload.algorithm)
    || payload.score_scale !== "0_to_1"
    || !Number.isInteger(payload.total)
    || payload.total < 0
    || !Array.isArray(payload.results)
    || payload.results.length !== payload.total
  ) {
    throw new Error("The matching service returned an invalid response.");
  }

  let previousScore = Number.POSITIVE_INFINITY;
  for (const result of payload.results) {
    if (
      !result
      || typeof result !== "object"
      || !Number.isInteger(result.pet_id)
      || !Number.isFinite(result.score)
      || result.score < 0
      || result.score > 1
      || !isScoreBreakdown(result.scores)
      || !isScoreBreakdown(result.final_scores)
    ) {
      throw new Error("The matching service returned invalid match scores.");
    }

    if (
      Math.abs(result.score - result.final_scores[payload.algorithm]) > 0.000001
      || result.score > previousScore
    ) {
      throw new Error("The matching service returned inconsistent match rankings.");
    }
    previousScore = result.score;
  }

  return payload;
}
