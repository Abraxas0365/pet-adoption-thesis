"use client";

import PetCard from "@/components/layout/pets/PetCard";
import usePets from "@/hooks/usePets";

export default function BrowsePetsPage() {
  const { pets, loading, error } = usePets();

  return (
    <main className="min-w-0 flex-1 max-h-screen overflow-x-hidden overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Browse Pets</h1>
        <p className="text-muted-foreground">Find your next companion.</p>
        {!loading && !error && (
          <p className="mt-2 text-sm text-muted-foreground">
            {pets.length} pets loaded on this page
          </p>
        )}
      </div>

      {loading ? (
        <p role="status">Loading pets...</p>
      ) : error ? (
        <p role="alert" className="text-destructive">
          Failed to load pets: {error}
        </p>
      ) : pets.length === 0 ? (
        <p>No pets found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </main>
  );
}
