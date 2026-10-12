
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
  preferred_breed: string;

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