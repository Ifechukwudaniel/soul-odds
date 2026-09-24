import { describe, expect, it } from 'vitest';
import { spendSoundSeconds } from '@/utils/playSound';
import { isSoundMuted } from '@/utils/soundPreferences';

describe('spendSoundSeconds', () => {
  it('plays more of the clip for larger spends', () => {
    expect([1, 5, 10, 25, 50].map(spendSoundSeconds)).toEqual([0.42, 0.42, 0.78, 1.25, 1.25]);
  });
});

describe('isSoundMuted', () => {
  it('returns false when storage is unavailable', () => {
    expect(isSoundMuted()).toBe(false);
  });
});
