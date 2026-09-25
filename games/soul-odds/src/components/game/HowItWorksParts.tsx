import type { IconType } from 'react-icons';
import { GiAnubis, GiHourglass, GiScales } from 'react-icons/gi';
import { GOLD_ARROW_FLANK, ModalHeader } from '@/components/game/GameModalParts';

// =====================================
// ⬢ Shared by the first-visit dialog and the profile card's view, so the copy can't drift.
// =====================================

type Step = { icon: IconType; title: string; text: string };

const STEPS: Step[] = [
  {
    icon: GiAnubis,
    title: 'Summon a soul',
    text: 'Pick your stake, then tap Summon. We pull a real person from history at random.',
  },
  {
    icon: GiHourglass,
    title: 'Make three guesses',
    text: 'Boy or girl, how long they lived, and whether they were good or sinful. Your stake is split across the three.',
  },
  {
    icon: GiScales,
    title: 'See how you did',
    text: 'Right guesses win, and rarer ones win more. Wrong ones lose. Every round also earns points for the leaderboard.',
  },
];

/** The "How it works" title with the gold arrows either side; `intro` adds a line under it. */
export const HowItWorksHeader = (props: { titleId?: string; intro?: string }) => (
  <ModalHeader
    title="How it works"
    titleId={props.titleId}
    intro={props.intro}
    flank={GOLD_ARROW_FLANK}
  />
);

/** The three plain steps. */
export const HowItWorksSteps = () => (
  <ol className="flex flex-col gap-4 max-md:gap-3">
    {STEPS.map((step, index) => (
      <li key={step.title} className="flex gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#F5B83D]/10"
        >
          <step.icon size={18} className="gold-icon" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">
            {index + 1}. {step.title}
          </p>
          <p className="mt-0.5 text-[0.8rem] leading-relaxed text-white/70">{step.text}</p>
        </div>
      </li>
    ))}
  </ol>
);
