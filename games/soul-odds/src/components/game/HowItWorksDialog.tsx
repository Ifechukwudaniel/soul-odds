'use client';

import { useId, useSyncExternalStore } from 'react';
import { GameButton } from '@/components/game/GameButton';
import { GameDialog } from '@/components/game/GameDialog';
import { ModalCloseButton, ModalCornerFrame } from '@/components/game/GameModalParts';
import { HowItWorksHeader, HowItWorksSteps } from '@/components/game/HowItWorksParts';
import {
  getHowItWorksSeen,
  getServerHowItWorksSeen,
  markHowItWorksSeen,
  subscribeHowItWorksSeen,
} from '@/utils/howItWorksSeen';

/** The first-visit dialog: the three steps under an intro line, closed with "Start playing". */
const HowItWorksDialog = (props: { isOpen: boolean; onClose: () => void }) => {
  const titleId = useId();

  return (
    <GameDialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      labelledBy={titleId}
      className="w-full max-w-md rounded-tl-md rounded-br-md"
    >
      <ModalCornerFrame />

      <div className="relative flex max-h-[calc(100dvh-3rem)] flex-col gap-5 overflow-y-auto rounded-2xl rounded-tl-md rounded-br-md p-6 text-left max-md:gap-4 max-md:p-5">
        <ModalCloseButton onClick={props.onClose} />

        <HowItWorksHeader titleId={titleId} intro="Guess the life of a stranger from history." />

        <HowItWorksSteps />

        <GameButton
          variant="papyrus"
          onClick={props.onClose}
          className="self-center px-8 py-2.5 text-sm"
        >
          Start playing
        </GameButton>
      </div>
    </GameDialog>
  );
};

/**
 * Opens the dialog by itself for a player who hasn't started a game, once per browser. Closing it in
 * any way (button, Escape, backdrop) counts as seen. Mount it outside the game's scroll container: that
 * container re-parents its children just after mount, and a modal <dialog> that gets moved loses its
 * top-layer status (no backdrop, and the page paints over it).
 */
export const FirstVisitHowItWorks = (props: { eligible: boolean }) => {
  const seen = useSyncExternalStore(
    subscribeHowItWorksSeen,
    getHowItWorksSeen,
    getServerHowItWorksSeen,
  );

  if (seen || !props.eligible) {
    return null;
  }

  return <HowItWorksDialog isOpen onClose={markHowItWorksSeen} />;
};
