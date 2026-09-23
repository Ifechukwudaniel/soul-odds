"use client";

import { useEffect, useState } from "react";
import { useCasinoHost } from "@/hooks/useCasinoHost";
import { type BetHistoryEntry, historyStorageKey, readHistory } from "@/lib/mortal-odds/bet-history";

/** The connected wallet's saved rounds, newest first; `loaded` flips once the wallet's history has been read. */
export function useBetHistory(): { entries: BetHistoryEntry[]; loaded: boolean } {
  const { snapshot } = useCasinoHost();
  const key = snapshot ? historyStorageKey(snapshot) : null;
  const [entries, setEntries] = useState<BetHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!key) return;
    setEntries(readHistory(key));
    setLoaded(true);
  }, [key]);

  return { entries, loaded };
}
