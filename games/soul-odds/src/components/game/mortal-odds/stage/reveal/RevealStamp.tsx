'use client';

import { motion } from 'framer-motion';

const TONE_CLASSES: Record<'win' | 'loss' | 'neutral', string> = {
  win: 'border-[#6BA84F] text-[#6BA84F] bg-[#6BA84F]/10',
  loss: 'border-[#B7410E] text-[#B7410E] bg-[#B7410E]/10',
  // ✦ The neutral (gold) stamp draws its dashed border as a gradient SVG rect and its text with `gold-stamp-text`.
  neutral: 'relative border-transparent bg-[#F5B83D]/10 gold-stamp-text',
};

export const RevealStamp = (props: {
  tone: 'win' | 'loss' | 'neutral';
  rotate?: number;
  className?: string;
  children: React.ReactNode;
}) => {
  const rotate = props.rotate ?? -4;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 1.7, rotate: rotate + 16 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ type: 'spring', stiffness: 320, damping: 14 }}
      className={`inline-block rounded border-2 border-dashed px-2 py-0.5 text-[11px] font-bold tracking-[0.15em] uppercase ${TONE_CLASSES[props.tone]} ${props.className ?? ''}`}
    >
      {props.tone === 'neutral' && (
        // ✦ A CSS border can't take a gradient, and a dashed one can't be masked; an SVG stroke can do both.
        <svg
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute -inset-0.5 size-[calc(100%+4px)] overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill="none"
            stroke="url(#gold-icon-gradient)"
            strokeWidth="2"
            strokeDasharray="5 3.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      {props.children}
    </motion.span>
  );
};
