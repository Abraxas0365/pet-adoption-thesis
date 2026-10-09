export type Pet = {
  id: number;
  external_pet_id: string;
  name: string;
  species: string;
  breed: string | null;
  ageMonths: number;
  sex: string | null;
  weight: number | null;
  color: string | null;
  size: string | null;
  temperament: string[];
  activity_level: string | null;
  medical_condition: string;
  vaccination_status: string;
  image_url: string | null;
  status: string;
  is_test_data: boolean;
};