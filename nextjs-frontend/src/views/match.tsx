"use client";

import { useState } from "react";

import { MatchPreferencesForm } from "@/components/layout/match/PreferenceForm";
import type {
  MatchPreferences,
  MatchingAlgorithm,
  MatchingResult,
} from "@/types/match";
import { ScrollArea } from "@/components/ui/scroll-area";
import { submitMatchRequest } from "@/services/matching";
import MatchResults from "@/components/layout/match/MatchResults";

export default function MatchView() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState<MatchingResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const [algorithm, setAlgorithm] =
    useState<MatchingAlgorithm>("weighted_cosine");

  const handleSubmit = async (preferences: MatchPreferences) => {
    setIsSubmitting(true);
    setError(null);
    setEmptyMessage(null);

    try {
      const response = await submitMatchRequest(preferences);
      setMatches(response.results);
      setAlgorithm(response.algorithm);
      if (response.results.length === 0) {
        setEmptyMessage(response.message);
      }
    } catch (caughtError) {
      setMatches([]);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to find matches.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto space-y-6 flex flex-1 max-h-screen min-w-0 max-w-full overflow-hidden">
      {matches.length > 0 ? (
        <ScrollArea className="space-y-3 min-w-1/2 p-6">
          <div>
            <h1 className="text-3xl font-bold">Find Your Match</h1>
            <p className="mt-2 text-muted-foreground">
              Tell us what you&apos;re looking for, and we&apos;ll help you find
              a compatible pet.
            </p>
          </div>

          <MatchPreferencesForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </ScrollArea>
      ) : (
        <ScrollArea className="space-y-3y min-w-full p-6">
          <div>
            <h1 className="text-3xl font-bold">Find Your Match</h1>
            <p className="mt-2 text-muted-foreground">
              Tell us what you&apos;re looking for, and we&apos;ll help you find
              a compatible pet.
            </p>
          </div>

          <MatchPreferencesForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </ScrollArea>
      )}
      {matches.length > 0 ? (
        <ScrollArea className="p-6 min-w-1/2">
          <MatchResults
            matches={matches}
            algorithm={algorithm}
            error={error}
            emptyMessage={emptyMessage}
          />
        </ScrollArea>
      ) : null}
    </main>
  );
}
