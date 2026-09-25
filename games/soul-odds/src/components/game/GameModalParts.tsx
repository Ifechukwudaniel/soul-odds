import { GiEyeOfHorus } from 'react-icons/gi';
import { PiXBold } from 'react-icons/pi';
import { CardCorner } from '@/components/assets/CardCorner';
import { GoldArrowLeft } from '@/components/assets/GoldArrowLeft';
import { GoldArrowRight } from '@/components/assets/GoldArrowRight';
import { serifFont } from '@/styles/serif-font';
import { playClickSound } from '@/utils/playClickSound';

/** The gold arrows either side of a modal title; pass it as `ModalHeader`'s `flank`. */
export const GOLD_ARROW_FLANK = {
  before: <GoldArrowLeft className="h-auto w-full max-w-[84px] min-w-0 flex-1" />,
  after: <GoldArrowRight className="h-auto w-full max-w-[84px] min-w-0 flex-1" />,
};

/**
 * The corner frame for an ornate modal: knots on the top-left and bottom-right of the dialog itself
 * (not its scrolling body, so they stay put). Nudged out by the art's own empty margin so its lines
 * sit flush on the border. Give the dialog `rounded-tl-md rounded-br-md` to match.
 */
export const ModalCornerFrame = () => (
  <>
    <CardCorner className="pointer-events-none absolute top-0 left-0 h-auto w-14 -translate-x-[2.469%] -translate-y-[1.656%] rotate-180 md:w-[72px]" />
    <CardCorner className="pointer-events-none absolute right-0 bottom-0 h-auto w-14 translate-x-[2.469%] translate-y-[1.656%] md:w-[72px]" />
  </>
);

export const ModalHeader = (props: {
  title: string;
  titleId?: string;
  intro?: string;
  /** Ornaments set on either side of the title, e.g. the gold arrows. */
  flank?: { before: React.ReactNode; after: React.ReactNode };
}) => {
  const heading = (
    <h2 id={props.titleId} className={`${serifFont.className} text-2xl font-bold text-[#F1D6AE]`}>
      {props.title}
    </h2>
  );

  return (
    <header className="flex flex-col items-center gap-2 text-center">
      <div className="flex w-full items-center gap-3">
        <span className="h-px flex-1 bg-linear-to-r from-transparent to-[#F5B83D]/60" />
        <GiEyeOfHorus size={28} className="gold-icon" />
        <span className="h-px flex-1 bg-linear-to-l from-transparent to-[#F5B83D]/60" />
      </div>
      {props.flank ? (
        <div className="flex w-full items-center justify-center gap-2">
          {props.flank.before}
          {heading}
          {props.flank.after}
        </div>
      ) : (
        heading
      )}
      {props.intro && <p className="text-[0.85rem] leading-relaxed text-white/70">{props.intro}</p>}
    </header>
  );
};

export const ModalCloseButton = (props: { onClick: () => void }) => (
  <button
    type="button"
    aria-label="Close"
    onClick={() => {
      playClickSound();
      props.onClick();
    }}
    className="absolute top-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:text-white max-md:h-9 max-md:w-9"
  >
    <PiXBold className="h-3.5 w-3.5" />
  </button>
);
