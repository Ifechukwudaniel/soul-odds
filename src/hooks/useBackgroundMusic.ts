"use client";

import { useEffect, useState } from "react";

const BG_MUSIC_SRC = "/sound/bg.mp3";
const MUTED_STORAGE_KEY = "game-bg-music-muted:v1";
const VOLUME_STORAGE_KEY = "game-bg-music-volume:v1";
const DEFAULT_VOLUME = 0.5;

let sharedAudio: HTMLAudioElement | null = null;

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function readVolume(): number {
  try {
    const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (stored === null) {
      return DEFAULT_VOLUME;
    }
    const parsed = Number(stored);
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

/** Lazily creates the single shared background-music element. */
function getAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio(BG_MUSIC_SRC);
    sharedAudio.loop = true;
    sharedAudio.preload = "auto";
    sharedAudio.volume = readVolume();
  }
  return sharedAudio;
}

/** Loops the shared background music and persists the mute toggle and volume across sessions. */
export function useBackgroundMusic(): {
  isMuted: boolean;
  toggle: () => void;
  volume: number;
  setVolume: (volume: number) => void;
} {
  const [isMuted, setIsMuted] = useState(false);
  const [volumeValue, setVolumeValue] = useState(DEFAULT_VOLUME);

  useEffect(() => {
    setIsMuted(readMuted());
    setVolumeValue(readVolume());
  }, []);

  useEffect(() => {
    getAudio().volume = volumeValue;
  }, [volumeValue]);

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

  const setVolume = (next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    setVolumeValue(clamped);
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
    } catch {
      // storage unavailable: the volume stays in memory
    }
  };

  return { isMuted, toggle, volume: volumeValue, setVolume };
}