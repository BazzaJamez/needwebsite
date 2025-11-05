"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { FlagsProvider } from "@/lib/client/flags";
import { ToastProvider } from "@/components/ui/toaster";
import type { FeatureFlags } from "@/lib/flags";

type ProvidersProps = {
  children: React.ReactNode;
  flags: FeatureFlags;
};

export function Providers({ children, flags }: ProvidersProps) {
  return (
    <SessionProvider>
      <FlagsProvider flags={flags}>
        {children}
        <ToastProvider />
      </FlagsProvider>
    </SessionProvider>
  );
}

