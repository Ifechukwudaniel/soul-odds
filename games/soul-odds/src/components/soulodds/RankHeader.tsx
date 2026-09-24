import Image from 'next/image';
import { badgesLists } from '@/components/screens/Badges';
import { useAppStore } from '@/services/store/store';

export const RankHeader = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const rank = useAppStore((state) => state.user.rank);
  const rankTitle = badgesLists[rank]?.title ?? badgesLists[0]!.title;

  const goToBadges = () => {
    setScreen('badges');
  };

  return (
    <div onClick={goToBadges} className="z-20">
      <div className="flex flex-col items-end text-right text-[0.8rem]">
        <p className="mb-[2px] text-left text-white">Rank</p>
        <Image src="/img/plankton.svg" alt="Plankton" width={24} height={24} priority />
        <p className="mt-[2px] text-left text-white">
          {rankTitle} {'>'}
        </p>
      </div>
    </div>
  );
};
