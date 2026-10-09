"use client";

import { useEffect, useState } from "react";
import { fetchPets } from "@/services/pets";
import type { Pet } from "@/types/pets";

export default function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPets() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPets(controller.signal);
        if (!controller.signal.aborted) {
          setPets(result);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Unable to load pets.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPets();
    return () => controller.abort();
  }, []);

  return { pets, loading, error };
}
