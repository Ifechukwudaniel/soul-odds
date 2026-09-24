'use client';

import { useId } from 'react';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { GameDialog } from '@/components/game/GameDialog';
import { ModalCloseButton, ModalHeader } from '@/components/game/GameModalParts';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { playClickSound } from '@/utils/playClickSound';

export const SettingsModal = (props: { isOpen: boolean; onClose: () => void }) => {
  const { isMuted, toggle, volume, setVolume } = useBackgroundMusic();
  const titleId = useId();

  return (
    <GameDialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      labelledBy={titleId}
      className="w-full max-w-md"
    >
      <div className="relative flex flex-col gap-5 p-6">
        <ModalCloseButton onClick={props.onClose} />

        <ModalHeader title="Settings" titleId={titleId} />

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
      </div>
    </GameDialog>
  );
};
