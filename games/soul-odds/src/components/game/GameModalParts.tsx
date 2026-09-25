import { GiEyeOfHorus } from 'react-icons/gi';
import { PiXBold } from 'react-icons/pi';
import { serifFont } from '@/styles/serif-font';
import { playClickSound } from '@/utils/playClickSound';

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
        <GiEyeOfHorus size={28} className="text-[#F5B83D]" />
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
