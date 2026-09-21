"use client";

import { useEffect, useState } from "react";
import { connectGameToHost, observeGameContentSize, type HostApiV1, type HostSnapshotV1 } from "@chain/casino-sdk/guest";
import { connectDemoHost, isStandalone } from "@/lib/demo-host";

type SnapshotListener = (snapshot: HostSnapshotV1 | null) => void;

type HostBridge = {
  promise: Promise<HostApiV1>;
  listeners: Set<SnapshotListener>;
  latest: () => HostSnapshotV1 | null;
};

let bridge: HostBridge | undefined;

/**
 * One connection per page. The host binds its guest proxy to the first
 * handshake, so connecting again on a remount (StrictMode in dev) would leave
 * the host pushing into a destroyed connection. Opened outside the host iframe,
 * the page talks to a local demo host instead, so the game is playable on its own.
 */
function hostBridge(): HostBridge {
  if (bridge) return bridge;
  const listeners = new Set<SnapshotListener>();
  let latest: HostSnapshotV1 | null = null;
  const publish = (snapshot: HostSnapshotV1 | null) => {
    latest = snapshot;
    listeners.forEach((listener) => listener(snapshot));
  };
  const promise = isStandalone()
    ? connectDemoHost(publish)
    : connectGameToHost({
        async setState(snapshot) {
          publish(snapshot);
        },
      }).promise;
  bridge = { promise, listeners, latest: () => latest };
  return bridge;
}

/**
 * Guest side of the casino bridge: exposes the host's signing API once the
 * handshake resolves, and mirrors every `setState` push into React state.
 */
export function useCasinoHost(): {
  hostApi: HostApiV1 | null;
  snapshot: HostSnapshotV1 | null;
} {
  const [hostApi, setHostApi] = useState<HostApiV1 | null>(null);
  const [snapshot, setSnapshot] = useState<HostSnapshotV1 | null>(null);

  useEffect(() => {
    const { promise, listeners, latest } = hostBridge();
    let mounted = true;
    listeners.add(setSnapshot);
    setSnapshot(latest());

    void promise
      .then((parent) => {
        if (mounted) setHostApi(parent);
      })
      .catch(() => {
        // Handshake with the host iframe failed — the "waiting for host" screen stays up.
      });

    return () => {
      mounted = false;
      listeners.delete(setSnapshot);
    };
  }, []);

  useEffect(() => {
    if (!hostApi) return;
    const observer = observeGameContentSize(hostApi);
    return () => observer.disconnect();
  }, [hostApi]);

  return { hostApi, snapshot };
}
