'use client';

import { useEffect, useRef } from 'react';

// Chromium can drop focus to <body> for one Tab press when leaving certain controls (observed with
// <input type="range">) at the edge of a native <dialog>'s focus trap, letting that one press look like
// it left the dialog (it snaps back on the next press, but with no visible focus ring in between). We
// reinforce the wrap ourselves at the two edges so Tab/Shift+Tab always land back inside, every press.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A controlled modal built on the native `<dialog>`: showModal/close track `isOpen`, so the browser
 * handles the focus trap, Escape-to-close and returning focus to whatever opened it for free.
 * A click on the dimmed backdrop closes it too; a click inside does not (it lands on a child, not the dialog).
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
      // The native "close" event covers every way the dialog closes (Escape, .close(), the backdrop click below),
      // so it's the single place that reports back to the caller.
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
