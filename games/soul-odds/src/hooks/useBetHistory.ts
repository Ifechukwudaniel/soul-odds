'use client';

import { useEffect, useState } from 'react';
import type { BetHistoryEntry } from '@/lib/mortal-odds/bet-history';
import { getBetHistory } from '@/services/data/bet-history';
import { useAppStore } from '@/services/store/store';

/** The connected wallet's saved rounds, newest first; `loaded` flips once they've been fetched. */
export function useBetHistory(): { entries: BetHistoryEntry[]; loaded: boolean } {
  const address = useAppStore((state) => state.user.address);
  const [entries, setEntries] = useState<BetHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!address) return;
    getBetHistory(address)
      .then(setEntries)
      .catch((error) => console.error('Could not load bet history:', error))
      .finally(() => setLoaded(true));
  }, [address]);

  return { entries, loaded };
}
