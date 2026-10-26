"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileView() {
  const session = useAuth();

  if (!session) {
    return (
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold">User Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Log in to view your profile. Guests can still browse pets and find matches.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-primary underline underline-offset-4"
        >
          Log in
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <h1 className="text-2xl font-semibold">User Profile</h1>
      <dl className="mt-4 space-y-2">
        <div>
          <dt className="font-medium">Name</dt>
          <dd className="text-muted-foreground">{session.user.name}</dd>
        </div>
        <div>
          <dt className="font-medium">Email</dt>
          <dd className="text-muted-foreground">{session.user.email}</dd>
        </div>
      </dl>
    </main>
  );
}
