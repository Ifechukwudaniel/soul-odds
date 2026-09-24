'use client';

import { useId, useRef } from 'react';
import type { IconType } from 'react-icons';
import { LuInfo } from 'react-icons/lu';
import { GameButton } from '@/components/game/GameButton';
import { ModalCloseButton, ModalHeader } from '@/components/game/GameModalParts';
import { playClickSound } from '@/utils/playClickSound';

export type InfoPoint = { icon: IconType; title: string; text: string; soon?: boolean };

/**
 * A small "i" button that opens a themed dialog explaining why a round step matters. Built on the
 * native <dialog>, so focus is trapped and returned for free.
 */
export const InfoDialog = (props: { title: string; intro: string; points: InfoPoint[] }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label={props.title}
        aria-haspopup="dialog"
        onClick={() => {
          playClickSound();
          dialogRef.current?.showModal();
        }}
        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#d4af37]/50 bg-[#F5B83D]/10 text-[#F5B83D] transition-colors hover:bg-[#F5B83D]/25 hover:text-[#FDE991]"
      >
        <LuInfo size={15} />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => {
          // ✦ A click on the dimmed backdrop lands on the <dialog> itself; clicks inside land on its children.
          if (event.target === event.currentTarget) {
            close();
          }
        }}
        className="info-dialog game-modal-panel fixed inset-0 m-auto h-fit w-[min(28rem,calc(100vw-2rem))] overflow-visible rounded-2xl p-0 text-white backdrop:bg-black/60"
      >
        <div className="relative flex max-h-[calc(100dvh-2rem)] flex-col gap-5 overflow-y-auto rounded-2xl p-6 text-left">
          <ModalCloseButton onClick={close} />

          <ModalHeader title={props.title} titleId={titleId} intro={props.intro} />

          <ul className="flex flex-col gap-4">
            {props.points.map((point) => (
              <li key={point.title} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#F5B83D]/10 text-[#F5B83D]">
                  <point.icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {point.title}
                    {point.soon && (
                      <span className="ml-2 rounded-full border border-[#F5B83D]/50 px-2 py-0.5 text-[10px] font-normal tracking-widest text-[#F5B83D] uppercase">
                        Soon
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[0.8rem] leading-relaxed text-white/70">{point.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <GameButton variant="papyrus" onClick={close} className="self-center px-8 py-2.5 text-sm">
            Got it
          </GameButton>
        </div>
      </dialog>
    </>
  );
};
