'use client';

import { GameButton } from '@/components/game/GameButton';
import { HowItWorksHeader, HowItWorksSteps } from '@/components/game/HowItWorksParts';
import { Scroller } from '@/components/Scroller';

/**
 * "How it works" inside the profile card, a lighter cousin of the first-visit dialog: no intro line
 * and a Back button instead of "Start playing". It fills the height the card already has, and the
 * steps scroll when a narrow screen wraps them onto more lines than fit.
 */
export const HowItWorksView = (props: { onBack: () => void }) => (
  <>
    <HowItWorksHeader />

    <Scroller className="min-h-0 flex-1">
      <div className="px-1">
        <HowItWorksSteps />
      </div>
    </Scroller>

    <GameButton
      variant="secondary"
      onClick={props.onBack}
      className="self-center px-6 py-2 text-sm"
    >
      ← Back
    </GameButton>
  </>
);
