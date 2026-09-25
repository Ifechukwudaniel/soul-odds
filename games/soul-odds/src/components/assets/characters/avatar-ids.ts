// ✦ Plain data with no image imports, so the API can validate ids without loading any UI assets.
//   `avatars.ts` types each avatar's id from this list, so the two can't drift apart.
export const AVATAR_IDS = ['slime', 'black', 'skull', 'mummy', 'ghost', 'raven'] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

/** Whether `id` names a real avatar; the API uses it so nothing but known ids is ever stored. */
export const isAvatarId = (id: unknown): id is AvatarId =>
  typeof id === 'string' && (AVATAR_IDS as readonly string[]).includes(id);
