import { HOW_IT_WORKS_SEEN_STORAGE_KEY } from '@/constants/storage';

let seen: boolean | null = null;
const listeners = new Set<() => void>();

function readSeen() {
  try {
    return localStorage.getItem(HOW_IT_WORKS_SEEN_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Whether this browser has already closed the first-visit "How it works" dialog. */
export const getHowItWorksSeen = () => {
  seen ??= readSeen();
  return seen;
};

/** Reported as seen on the server, so the dialog is closed in the server HTML and only opens on the client. */
export const getServerHowItWorksSeen = () => true;

export const subscribeHowItWorksSeen = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Remembers that the dialog was closed. Kept in memory too, so it stays closed when storage is unavailable. */
export const markHowItWorksSeen = () => {
  if (getHowItWorksSeen()) {
    return;
  }
  seen = true;
  try {
    localStorage.setItem(HOW_IT_WORKS_SEEN_STORAGE_KEY, '1');
  } catch {
    // ✦ storage unavailable: it stays closed for this session only
  }
  for (const listener of listeners) {
    listener();
  }
};
