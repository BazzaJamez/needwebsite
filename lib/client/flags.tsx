"use client";

import { createContext, useContext } from "react";
import type { FeatureFlags } from "@/lib/flags";

const FlagsContext = createContext<FeatureFlags | null>(null);

export function FlagsProvider({
  flags,
  children,
}: {
  flags: FeatureFlags;
  children: React.ReactNode;
}) {
  return <FlagsContext.Provider value={flags}>{children}</FlagsContext.Provider>;
}

export function useFlags() {
  const context = useContext(FlagsContext);
  if (!context) {
    throw new Error("useFlags must be used within FlagsProvider");
  }
  return context;
}

