"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getAuthSnapshot,
  parseAuthSession,
  subscribeToAuth,
} from "@/services/auth";

export function useAuth() {
  const snapshot = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    () => null,
  );

  return useMemo(() => parseAuthSession(snapshot), [snapshot]);
}
