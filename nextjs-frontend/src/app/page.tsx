"use client";

import Landing from "@/views/landing";
import Loading from "@/views/loading";
import { useHealth } from "@/hooks/useHealth";

export default function Home() {
  const { loading } = useHealth();

  if (loading) {
    return <Loading />;
  }

  return <Landing />;
}