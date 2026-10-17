"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchPetById } from "@/services/pets";
import type { MatchingAlgorithm, MatchingResult } from "@/types/match";
import type { Pet } from "@/types/pets";

type MatchResultsCardProps = {
  match: MatchingResult;
  algorithm: MatchingAlgorithm;
};

export default function MatchResultsCard({
  match,
  algorithm,
}: MatchResultsCardProps) {
  const [open, setOpen] = useState(false);
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const imageUrl =
    match.image_url ??
    `/images/pets-default/${match.species.toLowerCase()}.jpg`;
  const score = (match.score * 100).toFixed(1);

  const formatPetAge = (months: number | null | undefined): string => {
    if (months === null || months === undefined) {
      return "Not specified";
    }
    if (months < 12) {
      return `${months} month${months === 1 ? "" : "s"}`;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths === 0
      ? `${years} year${years === 1 ? "" : "s"}`
      : `${years}y ${remainingMonths}m`;
  };

  const detail = (value: string | number | null | undefined) =>
    value === null || value === undefined || value === ""
      ? "Not specified"
      : String(value);
  const petImageUrl =
    pet?.image_url ??
    `/images/pets-default/${(pet?.species ?? match.species).toLowerCase()}.jpg`;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen || pet || isLoadingDetails) {
      return;
    }

    setIsLoadingDetails(true);
    setDetailsError(null);
    fetchPetById(match.pet_id)
      .then(setPet)
      .catch((error: unknown) => {
        setDetailsError(
          error instanceof Error
            ? error.message
            : "Unable to load pet details.",
        );
      })
      .finally(() => setIsLoadingDetails(false));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="group block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View details for ${match.name}`}
      >
        <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Image
                  src={imageUrl}
                  alt={match.name}
                  width={64}
                  height={64}
                  unoptimized
                  className="size-16 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold">
                    {match.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {match.species} · {match.breed ?? "Mixed breed"}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {algorithm.replace("_", " ")} score
                </p>
                <p className="text-2xl font-bold text-primary">{score}%</p>
              </div>
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <span>Age: {formatPetAge(match.age_months)}</span>
              <span>Sex: {match.sex ?? "Unknown"}</span>
              <span>Compatibility: {score}%</span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(match.final_scores).map(([label, value]) => (
                <Badge key={label} variant="secondary">
                  {label.replace("_", " ")}: {(value * 100).toFixed(1)}%
                </Badge>
              ))}
            </div>
            <p className="text-right text-sm font-medium">View details →</p>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{pet?.name ?? match.name}</DialogTitle>
          <DialogDescription>
            {detail(pet?.breed ?? match.breed)} ·{" "}
            {pet?.species ?? match.species} · {detail(pet?.sex ?? match.sex)}
          </DialogDescription>
        </DialogHeader>

        <Image
          src={petImageUrl}
          alt={pet?.name ?? match.name}
          width={960}
          height={540}
          unoptimized
          className="aspect-video w-full rounded-lg object-cover"
        />

        {isLoadingDetails ? (
          <p className="text-sm text-muted-foreground">
            Loading pet details...
          </p>
        ) : null}
        {detailsError ? (
          <p role="alert" className="text-sm text-destructive">
            {detailsError}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <Detail
            label="Age"
            value={formatPetAge(pet?.ageMonths ?? match.age_months)}
          />
          <Detail label="Sex" value={detail(pet?.sex ?? match.sex)} />
          <Detail label="Species" value={detail(pet?.species ?? match.species)} />
          <Detail label="Breed" value={detail(pet?.breed ?? match.breed)} />
          <Detail label="Size" value={detail(pet?.size)} />
          <Detail
            label="Weight"
            value={pet?.weight === null || pet?.weight === undefined
              ? "Not specified"
              : `${pet.weight} kg`}
          />
          <Detail label="Color" value={detail(pet?.color)} />
          <Detail label="Activity" value={detail(pet?.activity_level)} />
          <Detail label="Status" value={detail(pet?.status)} />
          <Detail label="Pet ID" value={detail(pet?.external_pet_id)} />
        </div>

        <section className="space-y-2">
          <h4 className="text-sm font-semibold">Temperament</h4>
          {pet?.temperament.length ? (
            <div className="flex flex-wrap gap-2">
              {pet.temperament.map((trait) => (
                <Badge key={trait} variant="secondary">
                  {trait}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {pet ? "No temperament information available." : "Not specified"}
            </p>
          )}
        </section>

        <section className="space-y-1">
          <h4 className="text-sm font-semibold">Medical information</h4>
          <p className="text-sm text-muted-foreground">
            {pet?.medical_condition ?? "Not specified"}
          </p>
          <p className="text-sm text-muted-foreground">
            Vaccination: {pet?.vaccination_status ?? "Not specified"}
          </p>
        </section>

        <section className="space-y-1">
          <h4 className="text-sm font-semibold">Match compatibility</h4>
          <Detail label="Overall score" value={`${score}%`} />
          <div className="flex flex-wrap gap-2">
            {Object.entries(match.final_scores).map(([label, value]) => (
              <Badge key={label} variant="outline">
                {label.replace("_", " ")}: {(value * 100).toFixed(1)}%
              </Badge>
            ))}
          </div>
        </section>

        <Button type="button" className="w-full">
          Add to favorites
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium capitalize">{String(value)}</p>
    </div>
  );
}
