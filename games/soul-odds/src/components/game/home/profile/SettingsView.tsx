'use client';

import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { GameButton } from '@/components/game/GameButton';
import { ModalHeader } from '@/components/game/GameModalParts';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { playClickSound } from '@/utils/playClickSound';

/** The settings content shown inside the profile card; `onBack` returns to the profile menu. */
export const SettingsView = (props: { onBack: () => void }) => {
  const { isMuted, toggle, volume, setVolume } = useBackgroundMusic();

  return (
    <>
      <ModalHeader title="Settings" />

      <div className="flex flex-col gap-3 rounded-xl border border-[#d4af37]/25 bg-[#F5B83D]/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">Music volume</p>
          <button
            type="button"
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
            onClick={() => {
              playClickSound();
              toggle();
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#d4af37]/50 bg-[#F5B83D]/10 text-[#F5B83D] transition-colors hover:bg-[#F5B83D]/25 hover:text-[#FDE991]"
          >
            {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
          </button>
        </div>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          disabled={isMuted}
          aria-label="Music volume"
          onChange={(event) => setVolume(Number(event.target.value))}
          className="w-full accent-[#F5B83D] disabled:opacity-40"
        />
      </div>

      <GameButton
        variant="secondary"
        onClick={props.onBack}
        className="self-center px-6 py-2 text-sm"
      >
        ← Back
      </GameButton>
    </>
  );
};
