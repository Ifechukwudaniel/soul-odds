import type { ComponentType } from 'react';
import type { AvatarId } from '@/components/assets/characters/avatar-ids';
import { Black } from '@/components/assets/characters/Black';
import { Skull } from '@/components/assets/characters/Skull';
import { Slime } from '@/components/assets/characters/Slime';
import type { IconProps } from '@/types/icontypes';

export type Avatar = {
  id: AvatarId;
  name: string;
  Icon: ComponentType<IconProps>;
  cost: number;
};

const DEFAULT_AVATAR: Avatar = { id: 'skull', name: 'Skull', Icon: Skull, cost: 0 };

/** Every playable avatar. Add a new character component and an entry here to make it selectable. */
export const AVATARS: Avatar[] = [
  DEFAULT_AVATAR,
  { id: 'slime', name: 'Slime', Icon: Slime, cost: 0 },
  { id: 'black', name: 'Black', Icon: Black, cost: 0 },
];

export const DEFAULT_AVATAR_ID = DEFAULT_AVATAR.id;

/**
 * What the default used to be. Browsers that never picked an avatar saved it as their choice, so on
 * login it is treated as "never chose" and replaced by the current default rather than pushed up.
 */
export const LEGACY_DEFAULT_AVATAR_ID: AvatarId = 'slime';

export const getAvatarById = (id: string): Avatar =>
  AVATARS.find((avatar) => avatar.id === id) ?? DEFAULT_AVATAR;

