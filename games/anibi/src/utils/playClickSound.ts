/** Plays the shared button-click sound. */
export const playClickSound = () => {
  const audio = new Audio("/sound/click.mp3");
  audio.play().catch(() => {});
};
