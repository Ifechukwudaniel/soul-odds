"use client";

import { useEffect, useState } from "react";

const BG_MUSIC_SRC = "/sound/bg.mp3";
const MUTED_STORAGE_KEY = "game-bg-music-muted:v1";

let sharedAudio: HTMLAudioElement | null = null;

/** Lazily creates the single shared background-music element. */
function getAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio(BG_MUSIC_SRC);
    sharedAudio.loop = true;
    sharedAudio.preload = "auto";
    sharedAudio.volume = 0.5;
  }
  return sharedAudio;
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Loops the shared background music and persists the mute toggle across sessions. */
export function useBackgroundMusic(): { isMuted: boolean; toggle: () => void } {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(readMuted());
  }, []);

  useEffect(() => {
    const audio = getAudio();

    if (isMuted) {
      audio.pause();
      return;
    }

    const start = () => {
      audio.play().catch(() => {});
    };

    // Direct play works where autoplay is allowed; otherwise music starts on the first user gesture.
    audio.play().catch(() => {
      document.addEventListener("pointerdown", start, { once: true });
      document.addEventListener("keydown", start, { once: true });
    });

    return () => {
      document.removeEventListener("pointerdown", start);
      document.removeEventListener("keydown", start);
      audio.pause();
    };
  }, [isMuted]);

  const toggle = () => {
    setIsMuted((previous) => {
      const next = !previous;
      try {
        localStorage.setItem(MUTED_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // storage unavailable: the mute state stays in memory
      }
      return next;
    });
  };

  return { isMuted, toggle };
}