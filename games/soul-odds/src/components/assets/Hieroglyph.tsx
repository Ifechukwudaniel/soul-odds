import Image from 'next/image';
import hieroglyph from '@/public/egypt/Architecture/sand_architecture_floor_hieroglyph_carved_01.png';

export const Hieroglyph = ({ active }: { active: boolean }) => {
  return (
    <Image
      src={hieroglyph}
      alt="hieroglyph"
      width={32}
      height={32}
      className={active ? 'opacity-100' : 'opacity-40 grayscale'}
      priority
    />
  );
};
