"use client";

import Landing from "@/pages/landing";
import Loading from "@/pages/loading";
import { useHealth } from "@/hooks/useHealth";

export default function Home() {
  const { loading } = useHealth();

  if (loading) {
    return <Loading />;
  }

  return <Landing />;
}