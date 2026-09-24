import { isSoundMuted } from '@/utils/soundPreferences';

export const playClickSound = () => {
  if (isSoundMuted()) {
    return;
  }
  const audio = new Audio('/sound/click.mp3');
  audio.play().catch(() => {});
};
