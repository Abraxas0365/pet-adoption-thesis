"use client";

import { useState } from "react";

import { MatchPreferencesForm } from "@/components/layout/match/PreferenceForm";
import type { MatchPreferences } from "@/types/match";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  submitMatchRequest,
  type MatchingAlgorithm,
  type MatchingResult,
} from "@/services/matching";

const MAX_VISIBLE_MATCHES = 50;

export default function MatchView() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState<MatchingResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const [algorithm, setAlgorithm] =
    useState<MatchingAlgorithm>("weighted_cosine");
  const topMatches = matches.slice(0, MAX_VISIBLE_MATCHES);

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
          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {emptyMessage ? (
            <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recommended matches</h2>
            <span className="text-sm text-muted-foreground">
              Showing {topMatches.length} of {matches.length} results
            </span>
          </div>

          <div className="grid gap-4">
            {topMatches.map((match) => (
              <div
                key={match.pet_id}
                className="rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{match.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {match.species} • {match.breed ?? "Mixed breed"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {algorithm.replace("_", " ")} score
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {(match.score * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <span>Age: {match.age_months ?? "Unknown"} months</span>
                  <span>Sex: {match.sex ?? "Unknown"}</span>
                  <span>Compatibility: {(match.score * 100).toFixed(1)}%</span>
                </div>

                {match.scores ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {Object.entries(match.final_scores).map(
                      ([label, value]) => (
                        <span
                          key={label}
                          className="rounded-full bg-muted px-2 py-1"
                        >
                          {label.replace("_", " ")}:{" "}
                          {(Number(value) * 100).toFixed(1)}%
                        </span>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          {/* </section> */}
        </ScrollArea>
      ) : null}
    </main>
  );
}
