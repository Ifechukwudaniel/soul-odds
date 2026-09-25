import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MUTED_STORAGE_KEY, VOLUME_STORAGE_KEY } from '@/constants/storage';
import {
  getSoundPreferences,
  isSoundMuted,
  reloadSoundPreferences,
  setSoundMuted,
  setSoundVolume,
  subscribeSoundPreferences,
} from '@/utils/soundPreferences';

const fakeStorage = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
};

describe('soundPreferences', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', fakeStorage());
    reloadSoundPreferences();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('reading', () => {
    it('defaults to unmuted at half volume', () => {
      expect(getSoundPreferences()).toEqual({ muted: false, volume: 0.5 });
    });

    it('restores the saved mute flag and volume', () => {
      vi.stubGlobal(
        'localStorage',
        fakeStorage({ [MUTED_STORAGE_KEY]: '1', [VOLUME_STORAGE_KEY]: '0.2' }),
      );
      reloadSoundPreferences();
      expect(getSoundPreferences()).toEqual({ muted: true, volume: 0.2 });
    });

    it('falls back to the defaults for a corrupt volume', () => {
      vi.stubGlobal('localStorage', fakeStorage({ [VOLUME_STORAGE_KEY]: 'loud' }));
      reloadSoundPreferences();
      expect(getSoundPreferences().volume).toBe(0.5);
    });

    it('falls back to the defaults when storage throws', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => {
          throw new Error('blocked');
        },
      });
      reloadSoundPreferences();
      expect(getSoundPreferences()).toEqual({ muted: false, volume: 0.5 });
    });

    it('returns the same object until something changes', () => {
      expect(getSoundPreferences()).toBe(getSoundPreferences());
    });
  });

  describe('writing', () => {
    it('shares one mute flag with every reader', () => {
      setSoundMuted(true);
      expect(isSoundMuted()).toBe(true);
      expect(getSoundPreferences().muted).toBe(true);
    });

    it('persists the mute flag and volume', () => {
      const storage = fakeStorage();
      vi.stubGlobal('localStorage', storage);
      setSoundMuted(true);
      setSoundVolume(0.3);
      expect(storage.data.get(MUTED_STORAGE_KEY)).toBe('1');
      expect(storage.data.get(VOLUME_STORAGE_KEY)).toBe('0.3');
    });

    it('clamps the volume to 0 to 1', () => {
      setSoundVolume(4);
      expect(getSoundPreferences().volume).toBe(1);
      setSoundVolume(-1);
      expect(getSoundPreferences().volume).toBe(0);
    });

    it('keeps working in memory when storage throws on write', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => null,
        setItem: () => {
          throw new Error('quota');
        },
      });
      setSoundMuted(true);
      expect(isSoundMuted()).toBe(true);
    });
  });

  describe('subscribing', () => {
    it('notifies every subscriber on a change', () => {
      const header = vi.fn();
      const settings = vi.fn();
      const stopHeader = subscribeSoundPreferences(header);
      const stopSettings = subscribeSoundPreferences(settings);
      setSoundMuted(true);
      expect(header).toHaveBeenCalledTimes(1);
      expect(settings).toHaveBeenCalledTimes(1);
      stopHeader();
      stopSettings();
    });

    it('stops notifying after unsubscribing', () => {
      const listener = vi.fn();
      subscribeSoundPreferences(listener)();
      setSoundMuted(true);
      expect(listener).not.toHaveBeenCalled();
    });

    it('notifies when storage is reloaded from another tab', () => {
      const listener = vi.fn();
      const stop = subscribeSoundPreferences(listener);
      vi.stubGlobal('localStorage', fakeStorage({ [MUTED_STORAGE_KEY]: '1' }));
      reloadSoundPreferences();
      expect(listener).toHaveBeenCalledTimes(1);
      expect(isSoundMuted()).toBe(true);
      stop();
    });
  });
});
