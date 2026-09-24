'use client';

import { useEffect, useRef } from 'react';

// ✦ Chromium can drop focus to <body> on a Tab press at a native <dialog>'s focus-trap edges (seen
//   with <input type="range">). Wrap focus manually at both edges so every press lands back inside.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A controlled modal on the native `<dialog>`: the browser handles the focus trap, Escape and focus
 * return. A click on the dimmed backdrop closes it; a click inside doesn't.
 */
export const GameDialog = (props: {
  isOpen: boolean;
  onClose: () => void;
  labelledBy?: string;
  className?: string;
  children: React.ReactNode;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (props.isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!props.isOpen && dialog.open) {
      dialog.close();
    }
  }, [props.isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={props.labelledBy}
      // ✦ The native "close" event covers every close path (Escape, .close(), backdrop click), so
      //   it's the single place that reports back.
      onClose={props.onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          dialogRef.current?.close();
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') {
          return;
        }
        const dialog = dialogRef.current;
        const focusable = dialog
          ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
          : [];
        const first = focusable[0];
        const last = focusable.at(-1);
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
      }}
      className={`game-dialog game-modal-panel fixed inset-0 m-auto h-fit overflow-visible rounded-2xl p-0 text-white backdrop:bg-black/60 ${props.className ?? ''}`}
    >
      {props.children}
    </dialog>
  );
};
