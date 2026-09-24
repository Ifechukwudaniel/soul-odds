'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createLocalStorageLifeStoryCache,
  LifeStoryLoader,
} from '@/lib/mortal-odds/life-story-loader';
import type { LifeStoryPayload, LifeStoryState } from '@/lib/mortal-odds/life-story-loader';
import { sinsOf } from '@/lib/mortal-odds/sin-selection';
import { apiClient } from '@/libs/ApiClient';
import type { Life } from '@/types';

// The server bounds its own OpenRouter call (see OPENROUTER_TIMEOUT_MS in lib/mortal-odds/openrouter.ts)
// and should always respond well within this; it's a backstop for a hung request or a dropped
// response, so a network hiccup can't leave the player staring at the loader indefinitely.
const REQUEST_TIMEOUT_MS = 10_000;

async function fetchLifeStory(options: {
  life: Life;
  placeName: string;
}): Promise<LifeStoryPayload> {
  const { life, placeName } = options;
  const params = new URLSearchParams({
    sex: life.sex,
    location: placeName,
    year: String(life.year),
    age: String(life.age),
    deathYear: String(life.deathYear),
  });
  const cause = life.shock?.label ?? life.cause;
  if (cause) params.set('cause', cause);
  const sins = sinsOf(life);
  if (sins.length > 0) {
    params.set('sinPhrase', sins.map((sin) => sin.phrase).join(', and '));
  }

  const startedAt = Date.now();
  const response = await apiClient.get<{ story: string; name: string }>(
    `/api/mortal-odds/life-story?${params.toString()}`,
    { timeout: REQUEST_TIMEOUT_MS },
  );
  console.log(`[life-story] round-trip took ${Date.now() - startedAt}ms`);
  return { story: response.data.story, name: response.data.name };
}

/**
 * Identifies exactly this soul: `sessionKey` alone should already be unique per round, but
 * folding the actual facts in too means two different souls can never share a cache entry even
 * if a session key were ever reused — the failure mode that made "Summon another soul" show the
 * previous soul's land and year.
 */
function cacheKeyFor(sessionKey: string, life: Life, placeName: string): string {
  return [sessionKey, life.sex, life.year, life.age, life.deathYear, placeName].join(':');
}

export type { LifeStoryState, LifeStoryPayload };

/**
 * Resolves the life story (and the name OpenRouter invented for it) for this soul exactly once:
 * on success, or the locally-generated `fallbackStory` (with no name) once a request has
 * definitively failed. Reports `{ ready: false }` for as long as that's still undecided, on
 * purpose — showing the fallback and then swapping it out from under the player once the real
 * story lands reads as a bug, so callers should render a loading state instead of text that might
 * change.
 *
 * Backed by a `LifeStoryLoader`, whose cache survives a refresh and whose "latest key wins" rule
 * stops a slow response for a round the player has already left (e.g. "Summon another soul" fired
 * mid-request) from ever overwriting the newer one.
 */
export function useLifeStory(options: {
  sessionKey: string | null;
  life: Life;
  placeName: string;
  fallbackStory: string;
}): LifeStoryState {
  const { sessionKey, life, placeName, fallbackStory } = options;
  const fallback: LifeStoryPayload = { story: fallbackStory, name: null };
  const [state, setState] = useState<LifeStoryState>({ ready: false });

  // The request in flight for a given key always started with that same round's facts, so
  // reading the latest ones here (rather than closing over the values from whenever the loader
  // was constructed) can't mix a stale round's life/place into a still-pending fetch.
  const latest = useRef({ life, placeName });
  latest.current = { life, placeName };

  const loader = useRef<LifeStoryLoader | null>(null);
  if (!loader.current) {
    loader.current = new LifeStoryLoader({
      cache: createLocalStorageLifeStoryCache(),
      fetchStory: () => fetchLifeStory(latest.current),
    });
  }

  useEffect(() => {
    if (!sessionKey) {
      setState({ ready: true, payload: fallback });
      return;
    }
    setState(
      loader.current!.request(cacheKeyFor(sessionKey, life, placeName), fallback, (payload) =>
        setState({ ready: true, payload }),
      ),
    );
    // fallbackStory (not the `fallback` object, which is a fresh reference every render) is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, life, placeName, fallbackStory]);

  return state;
}
