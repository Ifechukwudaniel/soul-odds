"use client";

import { createContext, use, useState } from "react";
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

/**
 * Connects to the casino host and gates rendering until the handshake and first snapshot land.
 * The loader stays mounted through its own exit transition (see Loader's `ready`/`onExit`) so a
 * handshake that resolves instantly still dissolves out instead of flashing off screen.
 */
export function AppWalletProvider(props: { children: React.ReactNode }) {
  const { hostApi, snapshot } = useCasinoHost();
  const [connected, setConnected] = useState(false);

  if (!connected) {
    return (
      <Loader
        label="Connecting to host…"
        hint="The realm is taking a moment to answer…"
        ready={Boolean(hostApi && snapshot)}
        onExit={() => setConnected(true)}
      />
    );
  }

  return <CasinoHostContext.Provider value={{ hostApi, snapshot }}>{props.children}</CasinoHostContext.Provider>;
}
