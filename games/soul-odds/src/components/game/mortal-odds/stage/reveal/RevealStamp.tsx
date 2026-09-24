'use client';

import { motion } from 'framer-motion';

const TONE_CLASSES: Record<'win' | 'loss' | 'neutral', string> = {
  win: 'border-[#6BA84F] text-[#6BA84F] bg-[#6BA84F]/10',
  loss: 'border-[#B7410E] text-[#B7410E] bg-[#B7410E]/10',
  neutral: 'border-[#F5B83D] text-[#F5B83D] bg-[#F5B83D]/10',
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
      {props.children}
    </motion.span>
  );
};
