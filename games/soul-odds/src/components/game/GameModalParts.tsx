import { GiEyeOfHorus } from "react-icons/gi";
import { PiXBold } from "react-icons/pi";
import { serifFont } from "@/styles/serif-font";
import { playClickSound } from "@/utils/playClickSound";

/** The shared modal header: a gold Eye of Horus divider over a serif title, with an optional intro line. */
export const ModalHeader = (props: { title: string; titleId?: string; intro?: string }) => (
  <header className="flex flex-col items-center gap-2 text-center">
    <div className="flex w-full items-center gap-3">
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-[#F5B83D]/60" />
      <GiEyeOfHorus size={28} className="text-[#F5B83D]" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-[#F5B83D]/60" />
    </div>
    <h2 id={props.titleId} className={`${serifFont.className} font-bold text-2xl text-[#F1D6AE]`}>
      {props.title}
    </h2>
    {props.intro && <p className="text-[0.85rem] text-white/70 leading-relaxed">{props.intro}</p>}
  </header>
);

/** The shared modal close button, pinned to the top-right corner of a `relative` panel. */
export const ModalCloseButton = (props: { onClick: () => void }) => (
  <button
    type="button"
    aria-label="Close"
    onClick={() => {
      playClickSound();
      props.onClick();
    }}
    className="absolute top-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:text-white"
  >
    <PiXBold className="h-3.5 w-3.5" />
  </button>
);
