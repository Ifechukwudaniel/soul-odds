'use client';

import {
  connectGameToHost,
  observeGameContentSize,
  type HostApi,
  type HostSnapshot,
} from '@chain-protocol/casino-sdk/guest';
import { useEffect, useState } from 'react';
import { connectDemoHost, isStandalone } from '@/lib/demo-host';

type SnapshotListener = (snapshot: HostSnapshot | null) => void;

type HostBridge = {
  promise: Promise<HostApi>;
  listeners: Set<SnapshotListener>;
  latest: () => HostSnapshot | null;
};

let bridge: HostBridge | undefined;

/**
 * One connection per page: the host binds its guest proxy to the first handshake, so a StrictMode
 * remount must not reconnect. Outside the host iframe it talks to a local demo host so the game is
 * playable on its own.
 */
function hostBridge(): HostBridge {
  if (bridge) return bridge;
  const listeners = new Set<SnapshotListener>();
  let latest: HostSnapshot | null = null;
  const publish = (snapshot: HostSnapshot | null) => {
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
  hostApi: HostApi | null;
  snapshot: HostSnapshot | null;
} {
  const [hostApi, setHostApi] = useState<HostApi | null>(null);
  const [snapshot, setSnapshot] = useState<HostSnapshot | null>(null);

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
        // ✦ Handshake with the host iframe failed — the "waiting for host" screen stays up.
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
