import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Spinner className="size-8" />

      <p className="text-muted-foreground">
        Preparing PawMatch...
      </p>
    </main>
  );
}