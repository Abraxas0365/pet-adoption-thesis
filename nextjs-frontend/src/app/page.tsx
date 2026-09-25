"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/health");

        const data = await response.json();

        console.log("Laravel health:", data);

        if (response.ok) {
          console.log("PawMatch backend is healthy!");
        } else {
          console.log("PawMatch backend is degraded.");
        }
      } catch (error) {
        console.error("Failed to connect to Laravel:", error);
      }
    };

    checkHealth();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold">
        PawMatch
      </h1>
    </main>
  );
}