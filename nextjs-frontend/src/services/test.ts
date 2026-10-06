import type { PythonTestResponse } from "@/types/test";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function testPython(): Promise<PythonTestResponse> {
  const response = await fetch(`${API_URL}/api/python`);

  if (!response.ok) {
    throw new Error(
      `Failed to connect to Laravel: ${response.status}`
    );
  }

  return response.json();
}