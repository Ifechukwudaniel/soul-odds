import { AvatarImage } from '@/components/assets/characters/AvatarImage';
import raven from '@/public/img/raven.png';
import type { IconProps } from '@/types/icontypes';

// ✦ Almost square and almost black, so it is shown whole (not cropped) on a cool slate backdrop.
export const Raven = (props: IconProps) => (
  <AvatarImage
    {...props}
    src={raven}
    alt="Raven"
    fit="contain"
    backdrop="radial-gradient(circle at 62% 38%, #6f8f9c 0%, #34505d 55%, #16252d 100%)"
  />
);
