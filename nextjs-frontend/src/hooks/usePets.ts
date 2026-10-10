"use client";

import { useEffect, useState } from "react";
import { fetchPets } from "@/services/pets";
import type { Pet } from "@/types/pets";

export default function usePets(pagenum: number, petsPerPage: number) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPets() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPets(pagenum, petsPerPage, controller.signal);
        if (!controller.signal.aborted) {
          setPets(result.pets);
          setLastPage(result.lastPage);
          setTotal(result.total);
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
  }, [pagenum, petsPerPage]);

  return { pets, lastPage, total, loading, error };
}
