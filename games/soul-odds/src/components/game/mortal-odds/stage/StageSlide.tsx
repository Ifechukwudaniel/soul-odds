"use client";

import { AnimatePresence, motion } from "framer-motion";

const SWIPE_THRESHOLD = 60;

const slideVariants = {
  enter: (direction: number) => ({ x: direction >= 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction >= 0 ? -48 : 48, opacity: 0 }),
};

/** One animated slide of a stage carousel. Pass `onSwipe` to make it draggable on touch. */
export const StageSlide = (props: {
  slideKey: string | number;
  direction?: number;
  onSwipe?: (step: number) => void;
  children: React.ReactNode;
}) => {
  const direction = props.direction ?? 0;
  const onSwipe = props.onSwipe;

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={props.slideKey}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeOut" }}
          drag={onSwipe ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_event, info) => {
            if (!onSwipe) {
              return;
            }
            if (info.offset.x < -SWIPE_THRESHOLD) {
              onSwipe(1);
            }
            if (info.offset.x > SWIPE_THRESHOLD) {
              onSwipe(-1);
            }
          }}
          className="absolute inset-0 overflow-y-auto px-1"
        >
          {props.children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
