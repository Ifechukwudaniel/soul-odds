import { isSoundMuted } from "@/utils/soundPreferences";

/** Plays the shared button-click sound, unless the player has muted sound. */
export const playClickSound = () => {
  if (isSoundMuted()) {
    return;
  }
  const audio = new Audio("/sound/click.mp3");
  audio.play().catch(() => {});
};
