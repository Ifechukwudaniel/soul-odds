import { AvatarImage } from '@/components/assets/characters/AvatarImage';
import mummy from '@/public/img/mummy.png';
import type { IconProps } from '@/types/icontypes';

// ✦ 965 x 1450: the crop is held on the top so the glowing eyes stay in the circle.
export const Mummy = (props: IconProps) => (
  <AvatarImage {...props} src={mummy} alt="Mummy" focus="50% 10%" />
);
