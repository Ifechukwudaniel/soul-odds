"use client";

import { createContext, use } from "react";
import type { HostApiV1, HostSnapshotV1 } from "@chain/casino-sdk/guest";
import { Loader } from "@/components/Loader";
import { useCasinoHost } from "@/hooks/useCasinoHost";

type CasinoHostContextValue = {
  hostApi: HostApiV1 | null;
  snapshot: HostSnapshotV1 | null;
};

const CasinoHostContext = createContext<CasinoHostContextValue | null>(null);

/** The casino host connection, established once `AppWalletProvider` mounts. */
export function useCasinoHostContext(): CasinoHostContextValue {
  const value = use(CasinoHostContext);
  if (!value) {
    throw new Error("useCasinoHostContext must be used within AppWalletProvider");
  }
  return value;
}

/** Connects to the casino host and gates rendering until the handshake and first snapshot land. */
export function AppWalletProvider(props: { children: React.ReactNode }) {
  const { hostApi, snapshot } = useCasinoHost();

  if (!hostApi || !snapshot) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader />
          <span>Connecting to host…</span>
        </div>
      </div>
    );
  }

  return <CasinoHostContext.Provider value={{ hostApi, snapshot }}>{props.children}</CasinoHostContext.Provider>;
}
