'use client';

import { useState } from 'react';
import { Pet } from '@/types/pets';

import { 
    Card, CardContent,
} from '@/components/ui/card';

import { 
    Badge,
} from '@/components/ui/badge';

import {
    Button,
} from '@/components/ui/button';

import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from '@/components/ui/dialog';

type PetCardProps = {
    pet: Pet;
};

export default function PetCard({ pet }: PetCardProps) {
  const [open, setOpen] = useState(false);

  const imageUrl = pet.image_url;

  const formatDisplayValue = (
    value: string | number | null | undefined,
    fallback = 'Not specified'
  ): string => {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }

    return String(value);
  };

  function formatPetAge(months: number): string {
    if (months < 12) {
      return `${months} month${months === 1 ? "" : "s"}`;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
      return `${years} year${years === 1 ? "" : "s"}`;
    }

    return `${years}y ${remainingMonths}m`;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="group block w-full rounded-xl text-left
                     focus-visible:outline-none
                     focus-visible:ring-2
                     focus-visible:ring-ring">
        {/* <button
          type="button"
          className="group block w-full rounded-xl text-left
                     focus-visible:outline-none
                     focus-visible:ring-2
                     focus-visible:ring-ring"
          aria-label={`View details for ${pet.name}`}
        > */}
          <Card className="h-full overflow-hidden transition-all
                           duration-200 hover:-translate-y-1
                           hover:shadow-lg">
            <div className="relative aspect-4/3 overflow-hidden bg-muted">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={pet.name}
                  className="h-full w-full object-cover transition-transform
                             duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center
                                text-sm text-muted-foreground">
                  No photo available
                </div>
              )}

              <Badge className="absolute right-3 top-3">
                {pet.status ?? "Available"}
              </Badge>
            </div>

            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold">
                    {pet.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {pet.breed || pet.species}
                  </p>
                </div>

                <Badge variant="secondary" className="shrink-0">
                  {pet.sex}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>{formatPetAge(pet.ageMonths)}</span>
                <span>·</span>
                <span>{pet.size}</span>
                <span>·</span>
                <span>{pet.color}</span>
              </div>

              <div className="flex min-h-6 flex-wrap gap-1.5">
                {pet.temperament.slice(0, 3).map((trait) => (
                  <Badge key={trait} variant="outline">
                    {trait}
                  </Badge>
                ))}
                {pet.temperament.length > 3 && (
                  <Badge variant="outline">
                    +{pet.temperament.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  {pet.species}
                </span>
                <span className="text-sm font-medium">
                  View details →
                </span>
              </div>
            </CardContent>
          </Card>
        {/* </button> */}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {pet.name}
          </DialogTitle>
          <DialogDescription>
            {pet.breed} · {pet.species} · {pet.sex}
          </DialogDescription>
        </DialogHeader>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={pet.name}
            className="aspect-video w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center
                          rounded-lg bg-muted text-sm text-muted-foreground">
            No photo available
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Detail label="Age" value={formatPetAge(pet.ageMonths)} />
          <Detail label="Sex" value={formatDisplayValue(pet.sex)} />
          <Detail label="Size" value={formatDisplayValue(pet.size)} />
          <Detail label="Weight" value={pet.weight !== null ? `${pet.weight} kg` : 'Not specified'} />
          <Detail label="Color" value={formatDisplayValue(pet.color)} />
          <Detail label="Activity" value={formatDisplayValue(pet.activity_level)} />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Temperament</h4>
          <div className="flex flex-wrap gap-2">
            {pet.temperament.length > 0 ? (
              pet.temperament.map((trait) => (
                <Badge key={trait} variant="secondary">
                  {trait}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No temperament information available.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-semibold">Medical information</h4>
          <p className="text-sm text-muted-foreground">
            {pet.medical_condition || "No medical condition recorded."}
          </p>
          <p className="text-sm text-muted-foreground">
            Vaccination: {pet.vaccination_status || "Not specified"}
          </p>
        </div>

        <Button className="w-full" onClick={() => setOpen(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium capitalize">{String(value)}</p>
    </div>
  );
}