import { AvatarImage } from '@/components/assets/characters/AvatarImage';
import ghost from '@/public/img/ghost.png';
import type { IconProps } from '@/types/icontypes';

// ✦ 1053 x 1350: held on the top, where the hood and its two dark eye holes are.
export const Ghost = (props: IconProps) => (
  <AvatarImage {...props} src={ghost} alt="Ghost" focus="50% 6%" />
);
