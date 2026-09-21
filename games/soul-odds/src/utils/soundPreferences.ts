export const MUTED_STORAGE_KEY = "game-bg-music-muted:v1";

/** Reads the persisted mute flag shared by the music and the sound effects; false when storage is unavailable. */
export const isSoundMuted = () => {
  try {
    return localStorage.getItem(MUTED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};
