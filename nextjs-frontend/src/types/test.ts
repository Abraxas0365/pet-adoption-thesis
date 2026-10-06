export interface PythonTestResponse {
  message: string;
  status: string;
  service: string;
  data: {
    pet: string;
    score: number;
  };
}