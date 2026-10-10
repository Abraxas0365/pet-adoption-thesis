import type { Pet } from "@/types/pets";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ApiPet = {
  id: number;
  external_pet_id: string;
  name: string;
  pet_type: string;
  breed: string | null;
  age_months: number;
  sex: string | null;
  weight_kg: number | string | null;
  color: string | null;
  size: string | null;
  temperament: string[] | null;
  activity_level: string | null;
  has_medical_condition: boolean;
  vaccinated: boolean;
  image_url: string | null;
  status: string;
  is_test_data: boolean;
};

type PetApiResponse = {
  data: ApiPet[];
  current_page: number;
  last_page: number;
  total: number;
};

export type PetPage = {
  pets: Pet[];
  currentPage: number;
  lastPage: number;
  total: number;
};

export async function fetchPets(
  pagenum: number,
  petsPerPage: number,
  signal?: AbortSignal,
): Promise<PetPage> {
  const response = await fetch(`${API_URL}/api/pets?page=${pagenum}&per_page=${petsPerPage}`, { signal });

  if (!response.ok) {
    throw new Error(`Unable to load pets: API request failed (${response.status})`);
  }

  const result: PetApiResponse = await response.json();

  return {
    pets: result.data.map((pet) => ({
      id: pet.id,
      external_pet_id: pet.external_pet_id,
      name: pet.name,
      species: pet.pet_type,
      breed: pet.breed,
      ageMonths: pet.age_months,
      sex: pet.sex,
      weight: pet.weight_kg === null ? null : Number(pet.weight_kg),
      color: pet.color,
      size: pet.size,
      temperament: pet.temperament ?? [],
      activity_level: pet.activity_level,
      medical_condition: pet.has_medical_condition
        ? "Medical condition"
        : "Healthy",
      vaccination_status: pet.vaccinated ? "Vaccinated" : "Not vaccinated",
      image_url: pet.image_url,
      status: pet.status,
      is_test_data: pet.is_test_data,
    })),
    currentPage: result.current_page,
    lastPage: result.last_page,
    total: result.total,
  };
}
