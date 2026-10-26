
export const MATCH_OPTIONS = {
  species: ["dog", "cat", "bird", "rabbit"],
  breeds: {
    dog: [
      "Golden Retriever",
      "Labrador",
      "Poodle",
    ],
    cat: [
      "Persian",
      "Siamese",
    ],
    bird: [
      "Parakeet",
    ],
    rabbit: [
      "Rabbit",
    ],
  },
  sex: ["male", "female"],
  size: ["small", "medium", "large"],
  color: ["black", "white", "brown", "gray", "orange", "cream"],
  temperament: [
    "friendly",
    "playful",
    "calm",
    "affectionate",
    "energetic",
    "independent",
    "protective",
    "shy",
  ],
  activityLevel: ["low", "moderate", "high"],
  otherAnimals: ["dog", "cat", "bird", "rabbit"],
} as const;

export const HOME_OPTIONS = [
  { label: "House", value: "house" },
  { label: "Apartment", value: "apartment" },
  { label: "Condominium", value: "condo" },
  { label: "Other", value: "other" },
] as const;