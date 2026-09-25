import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HOW_IT_WORKS_SEEN_STORAGE_KEY } from '@/constants/storage';

const fakeStorage = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
};

// ✦ The module keeps its answer in memory, so each test loads a fresh copy.
const load = () => import('@/utils/howItWorksSeen');

describe('howItWorksSeen', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('reading', () => {
    it('is unseen in a browser that has never closed it', async () => {
      vi.stubGlobal('localStorage', fakeStorage());
      const { getHowItWorksSeen } = await load();
      expect(getHowItWorksSeen()).toBe(false);
    });

    it('is seen once it was closed before', async () => {
      vi.stubGlobal('localStorage', fakeStorage({ [HOW_IT_WORKS_SEEN_STORAGE_KEY]: '1' }));
      const { getHowItWorksSeen } = await load();
      expect(getHowItWorksSeen()).toBe(true);
    });

    it('is unseen when storage throws', async () => {
      vi.stubGlobal('localStorage', {
        getItem: () => {
          throw new Error('blocked');
        },
      });
      const { getHowItWorksSeen } = await load();
      expect(getHowItWorksSeen()).toBe(false);
    });

    it('reports seen on the server so the dialog starts closed', async () => {
      const { getServerHowItWorksSeen } = await load();
      expect(getServerHowItWorksSeen()).toBe(true);
    });
  });

  describe('marking seen', () => {
    it('persists the flag', async () => {
      const storage = fakeStorage();
      vi.stubGlobal('localStorage', storage);
      const { markHowItWorksSeen } = await load();
      markHowItWorksSeen();
      expect(storage.data.get(HOW_IT_WORKS_SEEN_STORAGE_KEY)).toBe('1');
    });

    it('notifies subscribers once, however often it is called', async () => {
      vi.stubGlobal('localStorage', fakeStorage());
      const { markHowItWorksSeen, subscribeHowItWorksSeen } = await load();
      const listener = vi.fn();
      subscribeHowItWorksSeen(listener);
      markHowItWorksSeen();
      markHowItWorksSeen();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('stays seen for the session when storage throws on write', async () => {
      vi.stubGlobal('localStorage', {
        getItem: () => null,
        setItem: () => {
          throw new Error('quota');
        },
      });
      const { getHowItWorksSeen, markHowItWorksSeen } = await load();
      markHowItWorksSeen();
      expect(getHowItWorksSeen()).toBe(true);
    });
  });
});
