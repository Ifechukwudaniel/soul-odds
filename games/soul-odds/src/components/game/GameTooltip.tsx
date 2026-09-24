'use client';

import { useId } from 'react';

/**
 * A small hover/focus tooltip, mainly for explaining why a control is disabled (a disabled native
 * element often won't fire hover/focus itself, so this wraps it in something that will). CSS-only —
 * `:hover`/`:focus` on the wrapper reveal it, so it works for pointer, keyboard and tap alike with no JS.
 */
export const GameTooltip = (props: {
  text: string;
  children: React.ReactNode;
  focusable?: boolean;
  className?: string;
}) => {
  const id = useId();

  return (
    <span
      tabIndex={props.focusable === false ? undefined : 0}
      aria-describedby={id}
      className={`group/tooltip relative inline-flex focus:outline-none ${props.className ?? ''}`}
    >
      {props.children}
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[14rem] -translate-x-1/2 rounded-lg border border-[#d4af37]/40 bg-[#0b0a08] px-3 py-1.5 text-center text-xs text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus/tooltip:opacity-100"
      >
        {props.text}
      </span>
    </span>
  );
};
