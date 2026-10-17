"use client";

import type { MatchingAlgorithm, MatchingResult } from "@/types/match";
import MatchResultsCard from "@/components/layout/match/MatchResultsCard";

const MAX_VISIBLE_MATCHES = 10;

type MatchResultsProps = {
  matches: MatchingResult[];
  algorithm: MatchingAlgorithm;
  error: string | null;
  emptyMessage: string | null;
};

export default function MatchResults({
  matches,
  algorithm,
  error,
  emptyMessage,
}: MatchResultsProps) {
  const topMatches = matches.slice(0, MAX_VISIBLE_MATCHES);

  return (
    <div className="space-y-3">
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
          <MatchResultsCard
            key={match.pet_id}
            match={match}
            algorithm={algorithm}
          />
        ))}
      </div>
    </div>
  );
}