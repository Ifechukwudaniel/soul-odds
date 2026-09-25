'use client';

import Image from 'next/image';
import { useState } from 'react';
import { GameButton } from '@/components/game/GameButton';
import { HistoryRoundModal } from '@/components/game/history/HistoryRoundModal';
import { HistoryTable } from '@/components/game/history/HistoryTable';
import { useBetHistory } from '@/hooks/useBetHistory';
import type { BetHistoryEntry } from '@/lib/mortal-odds/bet-history';
import { useAppStore } from '@/services/store/store';
import { Loader } from '../Loader';

const EmptyHistory = (props: { onSummon: () => void }) => (
  <div className="mt-8 flex flex-col items-center text-center">
    <div className="relative overflow-hidden">
      <Image src="/img/shine.svg" alt="" width={240} height={240} priority />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[2.5]">
        <Image
          src="/egypt/Relics/sand_relics_sarcophagus_open_01.png"
          alt=""
          width={50}
          height={50}
          unoptimized
        />
      </div>
    </div>
    <p className="font-[600]">No souls weighed yet</p>
    <p className="mt-1 mb-4 text-[0.8rem] text-[#AFAFAF]">Every bet you settle is written here.</p>
    <GameButton variant="papyrus" onClick={props.onSummon} className="px-6 py-3 text-base">
      Summon a soul
    </GameButton>
  </div>
);

export const BetHistoryScreen = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const { entries, loaded } = useBetHistory();
  const [selected, setSelected] = useState<BetHistoryEntry | null>(null);

  if (!loaded) {
    return <Loader className="h-full" />;
  }

  return (
    <div className="container mx-auto px-4 py-4 pb-32 max-md:pb-4">
      <h2 className="mb-3 text-2xl font-[500] max-md:text-xl">Bet history</h2>
      <p className="text-sm leading-[1.7] text-white max-md:text-[0.8rem] max-md:leading-[1.5] max-md:text-white/70">
        Every soul you&apos;ve weighed, and how the scales fell.
      </p>

      {entries.length === 0 ? (
        <EmptyHistory onSummon={() => setScreen('home')} />
      ) : (
        <div className="mt-8">
          <HistoryTable entries={entries} onSelect={setSelected} />
        </div>
      )}

      {selected && <HistoryRoundModal entry={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};
