import Image from 'next/image';
import share from '@/public/egypt/Monuments/sand_monuments_sphinx_statue_01.png';

export const Share = ({ active }: { active: boolean }) => {
  return (
    <Image
      src={share}
      alt="Share"
      width={35}
      height={35}
      className={active ? 'opacity-100' : 'opacity-40 grayscale'}
      priority
    />
  );
};
