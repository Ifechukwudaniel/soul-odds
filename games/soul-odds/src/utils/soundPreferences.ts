import { MUTED_STORAGE_KEY, VOLUME_STORAGE_KEY } from '@/constants/storage';

export type SoundPreferences = { muted: boolean; volume: number };

export const DEFAULT_VOLUME = 0.5;

const SERVER_SNAPSHOT: SoundPreferences = { muted: false, volume: DEFAULT_VOLUME };

const clampVolume = (volume: number) => Math.min(1, Math.max(0, volume));

function readStored(): SoundPreferences {
  try {
    const storedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    const parsed = storedVolume === null ? Number.NaN : Number(storedVolume);
    return {
      muted: localStorage.getItem(MUTED_STORAGE_KEY) === '1',
      volume: Number.isFinite(parsed) ? clampVolume(parsed) : DEFAULT_VOLUME,
    };
  } catch {
    return SERVER_SNAPSHOT;
  }
}

// ✦ One in-memory copy of the mute flag and volume that every consumer (header button, settings
//   dialog, music, click and map sounds) reads and writes, so they can never disagree. localStorage
//   only persists it; consumers never read storage themselves.
let state: SoundPreferences | null = null;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

/** The current preferences; the same object until something changes, as `useSyncExternalStore` needs. */
export const getSoundPreferences = () => {
  state ??= readStored();
  return state;
};

/** What the server renders and the client hydrates with, before storage is read. */
export const getServerSoundPreferences = () => SERVER_SNAPSHOT;

/** Re-reads storage, e.g. when another tab changed it, and tells subscribers. */
export const reloadSoundPreferences = () => {
  state = readStored();
  emit();
};

let storageListening = false;

const listenForOtherTabs = () => {
  if (storageListening || typeof window === 'undefined') {
    return;
  }
  storageListening = true;
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === MUTED_STORAGE_KEY || event.key === VOLUME_STORAGE_KEY) {
      reloadSoundPreferences();
    }
  });
};

export const subscribeSoundPreferences = (listener: () => void) => {
  listenForOtherTabs();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const update = (patch: Partial<SoundPreferences>) => {
  state = { ...getSoundPreferences(), ...patch };
  try {
    localStorage.setItem(MUTED_STORAGE_KEY, state.muted ? '1' : '0');
    localStorage.setItem(VOLUME_STORAGE_KEY, String(state.volume));
  } catch {
    // ✦ storage unavailable: the preferences stay in memory for this session
  }
  emit();
};

export const setSoundMuted = (muted: boolean) => update({ muted });

export const setSoundVolume = (volume: number) => update({ volume: clampVolume(volume) });

/** The shared mute flag for the music and every sound effect; false when storage is unavailable. */
export const isSoundMuted = () => getSoundPreferences().muted;
