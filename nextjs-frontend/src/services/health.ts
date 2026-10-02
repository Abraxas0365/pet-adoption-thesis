const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface HealthStatus {
  status: "ok" | "degraded";
  service: string;
  database: "ok" | "unavailable";
  microservice: "ok" | "unavailable";
}

export async function checkHealth(): Promise<HealthStatus> {
  const response = await fetch(`${API_URL}/api/health`);

  if (!response.ok) {
    throw new Error(
      `Health check failed with status ${response.status}`
    );
  }

  return response.json();
}