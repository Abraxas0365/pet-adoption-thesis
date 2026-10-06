// src/views/python-test.tsx

"use client";

import { useEffect, useState } from "react";
import { testPython } from "@/services/test";
import type { PythonTestResponse } from "@/types/test";
import Sidebar from "@/components/layout/Sidebar";

export default function PythonTest() {
  const [data, setData] = useState<PythonTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testPython()
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Something went wrong"),
      );
  }, []);

  return (
    <main className="flex  min-h-screen w-full overflow-x-hidden">
      <Sidebar />
      <div>
        <h1 className="text-2xl font-bold">Python Test</h1>

        <p className="mt-2 text-muted-foreground">
          Testing the Next.js → Laravel → FastAPI connection.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-destructive p-4 text-destructive">
            {error}
          </div>
        )}

        {data && (
          <pre className="mt-6 rounded-lg bg-muted p-4">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}
