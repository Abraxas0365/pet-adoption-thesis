
export type MatchPreferences = {
  preferred_species: string[];
  preferred_sex: string[];
  preferred_size: string[];
  preferred_color: string[];
  preferred_temperament: string[];
  preferred_activity_level: string[];

  preferred_age_min: number | null;
  preferred_age_max: number | null;
  preferred_weight_min: number | null;
  preferred_weight_max: number | null;
  preferred_breed: string[];

  home_type: string;
  has_other_animals: boolean;
  other_animals: string[];
  can_handle_medical_conditions: boolean;
  can_handle_special_care: boolean;
};

export type MatchPreferencesFormProps = {
  onSubmit: (
    preferences: MatchPreferences,
  ) => void | Promise<void>;
  isSubmitting?: boolean;
};

export type MatchingAlgorithm =
  | "weighted_cosine"
  | "jaccard"
  | "tversky";

export type MatchingScoreBreakdown = Record<MatchingAlgorithm, number>;

export type MatchingResult = {
  pet_id: number;
  name: string;
  species: string;
  breed: string | null;
  age_months: number | null;
  sex: string | null;
  image_url: string | null;
  score: number;
  scores: MatchingScoreBreakdown;
  final_scores: MatchingScoreBreakdown;
};

export type MatchingResponse = {
  status: "success";
  message: string;
  algorithm: MatchingAlgorithm;
  score_scale: "0_to_1";
  total: number;
  results: MatchingResult[];
};