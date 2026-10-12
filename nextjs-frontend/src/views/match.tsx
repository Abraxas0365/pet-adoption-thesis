"use client";

import { useState } from "react";

import { MatchPreferencesForm } from "@/components/layout/match/PreferenceForm";
import type { MatchPreferences } from "@/types/match";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MatchView() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (preferences: MatchPreferences) => {
    setIsSubmitting(true);

    try {
      // TODO: Send preferences to your Laravel API.
      console.log(preferences);
    } catch (error) {
      console.error("Failed to find matches:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto space-y-6 flex flex-1 max-h-screen min-w-0 max-w-screen">
      <ScrollArea className="p-6 min-w-full">
        <div>
          <h1 className="text-3xl font-bold">Find Your Match</h1>
          <p className="mt-2 text-muted-foreground">
            Tell us what you're looking for, and we'll help you find a
            compatible pet.
          </p>

          <MatchPreferencesForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </ScrollArea>
    </main>
  );
}
