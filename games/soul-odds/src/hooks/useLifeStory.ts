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

// ✦ Backstop for a hung or dropped request so the player never stares at the loader forever; the
//   server already bounds its own OpenRouter call (OPENROUTER_TIMEOUT_MS in
//   lib/mortal-odds/openrouter.ts).
const REQUEST_TIMEOUT_MS = 15_000;

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
 * Identifies exactly this soul: `sessionKey` plus the actual facts, so two souls never share a
 * cache entry even if a session key is reused.
 */
function cacheKeyFor(sessionKey: string, life: Life, placeName: string): string {
  return [sessionKey, life.sex, life.year, life.age, life.deathYear, placeName].join(':');
}

export type { LifeStoryState, LifeStoryPayload };

/**
 * Resolves the life story (and the name OpenRouter invented) once: the fetched one on success, or
 * `fallbackStory` (no name) once the request has definitively failed.
 *
 * Reports `{ ready: false }` while undecided so callers render a loader instead of text that would
 * swap. Backed by a `LifeStoryLoader`, whose cache survives a refresh and whose latest-key-wins
 * rule drops stale responses.
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

  // ✦ Read the latest facts here rather than the ones closed over when the loader was built, so a
  //   pending fetch never mixes rounds.
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
    // ✦ fallbackStory (not the `fallback` object, which is a fresh reference every render) is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, life, placeName, fallbackStory]);

  return state;
}
