'use client';

import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { playClickSound } from '@/utils/playClickSound';

export const SoundToggleButton = () => {
  const { isMuted, toggle } = useBackgroundMusic();

  return (
    <button
      type="button"
      aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
      onClick={() => {
        playClickSound();
        toggle();
      }}
      className="mystic-glass-gold flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border text-white transition-colors hover:bg-white/10"
    >
      {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
    </button>
  );
};
