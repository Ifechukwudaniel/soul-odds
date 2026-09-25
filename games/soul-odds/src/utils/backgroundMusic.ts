import { getSoundPreferences, subscribeSoundPreferences } from '@/utils/soundPreferences';

const BG_MUSIC_SRC = '/sound/bg.mp3';

// ✦ pointerup, not pointerdown: on touch screens only the release counts as a user gesture, so a
//   retry on pointerdown is rejected again and used up.
const GESTURE_EVENTS = ['pointerup', 'keydown'] as const;

type MusicWindow = Window & { __soulOddsMusic?: HTMLAudioElement };

// ✦ Kept on window, not in a module variable: a second copy of this module (hot reload, a split chunk)
//   would otherwise create a second element, and two loops would play over each other.
function getAudio(): HTMLAudioElement {
  const host = window as MusicWindow;
  if (!host.__soulOddsMusic) {
    const audio = new Audio(BG_MUSIC_SRC);
    audio.loop = true;
    audio.preload = 'auto';
    host.__soulOddsMusic = audio;
  }
  return host.__soulOddsMusic;
}

let waitingForGesture = false;

const stopWaitingForGesture = () => {
  waitingForGesture = false;
  for (const type of GESTURE_EVENTS) {
    document.removeEventListener(type, onGesture, true);
  }
};

const waitForGesture = () => {
  if (waitingForGesture) {
    return;
  }
  waitingForGesture = true;
  for (const type of GESTURE_EVENTS) {
    document.addEventListener(type, onGesture, true);
  }
};

/**
 * Makes the music match the current preferences: plays when unmuted, pauses when muted. It reads the
 * preferences at the moment it runs, so a retry that fires late can never start music that has since
 * been muted.
 */
export function syncMusic() {
  const preferences = getSoundPreferences();
  const audio = getAudio();
  audio.volume = preferences.volume;

  if (preferences.muted) {
    audio.pause();
    stopWaitingForGesture();
    return;
  }

  audio.play().catch((error: unknown) => {
    // ✦ AbortError means a pause() landed while play() was still loading. That pause came from a
    //   mute, which already decided the outcome, so there is nothing to retry.
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }
    waitForGesture();
  });
}

function onGesture() {
  stopWaitingForGesture();
  syncMusic();
}

let started = false;

/** Starts the music and keeps it in step with every later change to the preferences. Safe to call repeatedly. */
export function initBackgroundMusic() {
  if (started || typeof window === 'undefined') {
    return;
  }
  started = true;
  subscribeSoundPreferences(syncMusic);
  syncMusic();
}
