import { describe, expect, it } from 'vitest';
import { AVATAR_IDS, isAvatarId } from '@/components/assets/characters/avatar-ids';

describe('isAvatarId', () => {
  it('accepts every listed avatar', () => {
    expect(AVATAR_IDS.every((id) => isAvatarId(id))).toBe(true);
  });

  it('rejects an unknown id', () => {
    expect(isAvatarId('dragon')).toBe(false);
  });

  it('rejects values that are not strings', () => {
    expect([undefined, null, 5, {}, ['slime']].some(isAvatarId)).toBe(false);
  });
});
