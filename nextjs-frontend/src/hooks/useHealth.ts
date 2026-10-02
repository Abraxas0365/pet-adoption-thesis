"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkHealth,
  type HealthStatus,
} from "@/services/health";

export function useHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setLoading(true);

    try {
      setError(null);

      const result = await checkHealth();

      setHealth(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the API"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return {
    health,
    loading,
    error,
    isHealthy: health?.status === "ok",
    refresh: check,
  };
}