import Image from 'next/image';
import sarcophagus from '@/public/egypt/Relics/sand_relics_sarcophagus_open_01.png';

export const Sarcophagus = ({ active }: { active: boolean }) => {
  return (
    <Image
      src={sarcophagus}
      alt="Sarcophagus"
      width={32}
      height={32}
      className={active ? 'opacity-100' : 'opacity-40 grayscale'}
      priority
    />
  );
};
