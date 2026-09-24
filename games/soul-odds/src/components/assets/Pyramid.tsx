import Image from 'next/image';
import pyramid from '@/public/egypt/Monuments/sand_monuments_great_pyramid_01.png';

export const Pyramid = ({ active }: { active: boolean }) => {
  return (
    <Image
      src={pyramid}
      alt="Great Pyramid"
      width={32}
      height={32}
      className={active ? 'opacity-100' : 'opacity-40 grayscale'}
      priority
    />
  );
};
