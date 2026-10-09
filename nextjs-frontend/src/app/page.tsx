"use client";

import Landing from "@/views/landing";
import Loading from "@/views/loading";
import { useHealth } from "@/hooks/useHealth";
import Sidebar from "@/components/layout/Sidebar";

export default function Home() {
  const { loading } = useHealth();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <Landing />
    </div>
  );
}