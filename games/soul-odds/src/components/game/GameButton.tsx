"use client";

import { playClickSound } from "@/utils/playClickSound";

const VARIANT_CLASSES: Record<"primary" | "secondary" | "papyrus", string> = {
  primary:
    "accent-gradient border-black text-slate-950 shadow-[0_3px_0_0_#00000080,inset_0_1px_0_0_#ffffff80] active:translate-y-[3px] active:shadow-[inset_0_2px_3px_0_#00000066]",
  secondary:
    "border-black bg-[#262433] text-[#AFAFAF] shadow-[0_3px_0_0_#00000080,inset_0_1px_0_0_#ffffff1a] hover:text-white active:translate-y-[3px] active:shadow-[inset_0_2px_3px_0_#00000066]",
  // Aged papyrus card with a gold-leaf border, so the "light" button still reads as Anubis-palette instead of a generic white CTA.
  papyrus:
    "border-[#d4af37] bg-gradient-to-b from-[#f3ead2] to-[#e8dcc0] text-[#33353D] shadow-[0_3px_0_0_#7a5a1f80,inset_0_1px_0_0_#fff8e8b3] hover:brightness-105 active:translate-y-[3px] active:shadow-[inset_0_2px_3px_0_#4a2f0066]",
};

/** Chunky bordered CTA shared across the game screens that visibly presses in on click, like a physical button. */
export const GameButton = (props: {
  variant: "primary" | "secondary" | "papyrus";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    disabled={props.disabled}
    onClick={() => {
      playClickSound();
      props.onClick();
    }}
    className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border font-bold transition-all duration-150 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none ${VARIANT_CLASSES[props.variant]} ${props.className ?? ""}`}
  >
    {props.children}
  </button>
);
