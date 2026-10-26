"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fetchPetById } from "@/services/pets";
import type { Pet } from "@/types/pets";

export default function AdoptView() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const petIdParam = new URLSearchParams(window.location.search).get("petId");
    const petId = petIdParam ? Number(petIdParam) : NaN;
    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        if (!Number.isInteger(petId) || petId <= 0) {
          throw new Error("No valid pet was selected.");
        }

        return fetchPetById(petId, controller.signal);
      })
      .then(setPet)
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load pet details.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  if (isLoading) {
    return <main className="flex-1 p-8">Loading selected pet...</main>;
  }

  if (error) {
    return (
      <main className="flex-1 p-8">
        <p role="alert" className="text-destructive">
          {error}
        </p>
      </main>
    );
  }

  if (!pet) {
    return (
      <main className="flex-1 p-8">
        <p role="alert" className="text-destructive">
          Pet details are unavailable.
        </p>
      </main>
    );
  }

  const age =
    pet.ageMonths < 12
      ? `${pet.ageMonths} month${pet.ageMonths === 1 ? "" : "s"}`
      : `${Math.floor(pet.ageMonths / 12)} year${Math.floor(pet.ageMonths / 12) === 1 ? "" : "s"}${
          pet.ageMonths % 12
            ? ` ${pet.ageMonths % 12} month${pet.ageMonths % 12 === 1 ? "" : "s"}`
            : ""
        }`;

  const petImage =
    pet.image_url ?? `/images/pets-default/${pet.species.toLowerCase()}.jpg`;

  return (
    <main className="flex-1 space-y-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">Adopt {pet.name}</h1>

      <Card className="mx-auto w-full max-w-3xl overflow-hidden">
        <Image
          src={petImage}
          alt={pet.name}
          width={960}
          height={540}
          unoptimized
          className="aspect-video w-full object-cover"
        />
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">{pet.name}</h2>
              <p className="text-muted-foreground">
                {pet.breed || "Mixed breed"} · {pet.species}
              </p>
            </div>
            <Badge>{pet.status}</Badge>
          </div>

          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <PetDetail label="Age" value={age} />
            <PetDetail label="Sex" value={pet.sex ?? "Not specified"} />
            <PetDetail label="Size" value={pet.size ?? "Not specified"} />
            <PetDetail
              label="Weight"
              value={pet.weight === null ? "Not specified" : `${pet.weight} kg`}
            />
            <PetDetail label="Color" value={pet.color ?? "Not specified"} />
            <PetDetail
              label="Activity"
              value={pet.activity_level ?? "Not specified"}
            />
            <PetDetail label="Medical information" value={pet.medical_condition} />
            <PetDetail
              label="Vaccination"
              value={pet.vaccination_status}
            />
            <PetDetail label="Pet ID" value={pet.external_pet_id} />
          </dl>

          <section className="space-y-2">
            <h3 className="font-semibold">Temperament</h3>
            {pet.temperament.length ? (
              <div className="flex flex-wrap gap-2">
                {pet.temperament.map((trait) => (
                  <Badge key={trait} variant="secondary">
                    {trait}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No temperament information available.
              </p>
            )}
          </section>
        </CardContent>
      </Card>
    </main>
  );
}

function PetDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
