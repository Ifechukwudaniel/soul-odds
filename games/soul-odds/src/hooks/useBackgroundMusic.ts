'use client';

import { useSyncExternalStore } from 'react';
import { initBackgroundMusic } from '@/utils/backgroundMusic';
import {
  getServerSoundPreferences,
  getSoundPreferences,
  setSoundMuted,
  setSoundVolume,
  subscribeSoundPreferences,
} from '@/utils/soundPreferences';

// ✦ Subscribing is the first thing that runs on the client, so it also starts the music (once,
//   however many components use this hook).
const subscribe = (listener: () => void) => {
  initBackgroundMusic();
  return subscribeSoundPreferences(listener);
};

/** The shared mute flag and volume; every component using it sees the same values. */
export function useBackgroundMusic(): {
  isMuted: boolean;
  toggle: () => void;
  volume: number;
  setVolume: (volume: number) => void;
} {
  const preferences = useSyncExternalStore(
    subscribe,
    getSoundPreferences,
    getServerSoundPreferences,
  );

  return {
    isMuted: preferences.muted,
    toggle: () => setSoundMuted(!getSoundPreferences().muted),
    volume: preferences.volume,
    setVolume: setSoundVolume,
  };
}
