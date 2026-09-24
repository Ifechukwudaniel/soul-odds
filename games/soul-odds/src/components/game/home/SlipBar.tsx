'use client';

import { motion } from 'framer-motion';
import { LuChevronUp, LuX } from 'react-icons/lu';
import { CurrencyCoinIcon } from '@/components/assets/CurrencyCoinIcon';
import { playClickSound } from '@/utils/playClickSound';

const SWIPE_CLOSE_PX = 60;

/** Phone-only HUD strip above the nav: stake, potential win and picks made. Tap it to open the wager slip. */
export const SlipBar = (props: {
  stake: number;
  potentialWin: number;
  pickCount: number;
  requiredBets: number;
  currency: string;
  isOpen: boolean;
  controlsId: string;
  onToggle: () => void;
}) => (
  <button
    type="button"
    aria-expanded={props.isOpen}
    aria-controls={props.controlsId}
    aria-label={`Wager slip: stake ${props.stake.toFixed(2)} ${props.currency}, potential win ${props.potentialWin.toFixed(2)}, ${props.pickCount} of ${props.requiredBets} picks`}
    onClick={() => {
      playClickSound();
      props.onToggle();
    }}
    className="mystic-glass-gold flex h-(--slip-h) w-full shrink-0 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 text-left transition-transform duration-100 active:translate-y-0.5 lg:hidden"
  >
    <span className="flex items-center gap-2">
      <CurrencyCoinIcon width={22} height="22" />
      <span className="flex flex-col leading-tight">
        <span className="text-[0.6rem] tracking-[0.15em] text-white/50 uppercase">Stake</span>
        <span className="text-sm font-bold text-white tabular-nums">{props.stake.toFixed(2)}</span>
      </span>
    </span>

    <span className="flex flex-col items-center leading-tight">
      <span className="text-[0.6rem] tracking-[0.15em] text-white/50 uppercase">Potential win</span>
      <span className="text-sm font-bold text-[#F5B83D] tabular-nums">
        {props.potentialWin.toFixed(2)}
      </span>
    </span>

    <span className="flex items-center gap-2">
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: props.requiredBets }, (_, index) => (
          <span
            key={index}
            className={`h-2 w-2 rounded-full ${index < props.pickCount ? 'bg-[#F5B83D]' : 'bg-white/20'}`}
          />
        ))}
      </span>
      <LuChevronUp
        size={18}
        className={`text-[#F5B83D] transition-transform duration-200 ${props.isOpen ? 'rotate-180' : ''}`}
      />
    </span>
  </button>
);

/** Top of the phone wager sheet: a grab handle you can drag down, plus a close button. */
export const SlipSheetHandle = (props: { onClose: () => void }) => (
  <div className="relative flex items-center justify-center pt-1 pb-3 lg:hidden">
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.4}
      onDragEnd={(_event, info) => {
        if (info.offset.y > SWIPE_CLOSE_PX) {
          props.onClose();
        }
      }}
      className="flex h-6 w-24 cursor-grab touch-none items-center justify-center"
    >
      <span className="h-1.5 w-12 rounded-full bg-white/25" />
    </motion.div>
    <button
      type="button"
      aria-label="Close wager slip"
      onClick={() => {
        playClickSound();
        props.onClose();
      }}
      className="absolute top-0 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/60"
    >
      <LuX size={18} />
    </button>
  </div>
);
