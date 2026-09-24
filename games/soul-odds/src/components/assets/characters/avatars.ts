import type { ComponentType } from 'react';
import { Black } from '@/components/assets/characters/Black';
import { Skull } from '@/components/assets/characters/Skull';
import { Slime } from '@/components/assets/characters/Slime';
import type { IconProps } from '@/types/icontypes';

export type Avatar = {
  id: string;
  name: string;
  Icon: ComponentType<IconProps>;
  cost: number;
};

const DEFAULT_AVATAR: Avatar = { id: 'slime', name: 'Slime', Icon: Slime, cost: 0 };

/** Every playable avatar. Add a new character component and an entry here to make it selectable. */
export const AVATARS: Avatar[] = [
  DEFAULT_AVATAR,
  { id: 'black', name: 'Black', Icon: Black, cost: 0 },
  { id: 'skull', name: 'Skull', Icon: Skull, cost: 0 },
];

export const DEFAULT_AVATAR_ID = DEFAULT_AVATAR.id;

export const getAvatarById = (id: string): Avatar =>
  AVATARS.find((avatar) => avatar.id === id) ?? DEFAULT_AVATAR;

/**
 * Deterministically picks an avatar for a user id, so the same user always gets the same "random" avatar.
 * @param userId - The user's stable id.
 * @returns The avatar assigned to this user.
 */
export const getRandomAvatarForUser = (userId: string): Avatar => {
  const hash = [...userId].reduce((acc, char) => acc * 31 + (char.codePointAt(0) ?? 0), 0);
  const index = Math.trunc(Math.abs(hash)) % AVATARS.length;
  return AVATARS[index] ?? DEFAULT_AVATAR;
};
