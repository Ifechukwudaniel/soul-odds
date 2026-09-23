"use client";

import { motion } from "framer-motion";
import { LuBookOpen, LuChevronDown } from "react-icons/lu";
import { RevealSection } from "@/components/game/mortal-odds/stage/reveal/RevealSection";
import type { LifeStoryState } from "@/hooks/useLifeStory";

const SKELETON_LINE_WIDTHS = ["w-full", "w-11/12", "w-full", "w-4/5"];

const StoryLoading = () => (
  <div className="flex flex-col gap-3" aria-label="Writing this soul's story…" role="status">
    {SKELETON_LINE_WIDTHS.map((width, index) => (
      <div key={width + index} className={`h-4 ${width} animate-pulse rounded-full bg-white/10`} />
    ))}
  </div>
);

/**
 * The narrative of the soul's life. Waits for an OpenRouter-written story for this exact soul,
 * showing a loading placeholder rather than the local template — swapping visible text out from
 * under the player reads as a bug, not a feature — and only ever renders the template once the
 * request has definitively failed.
 */
export const SoulStory = (props: { state: LifeStoryState }) => (
  <RevealSection icon={LuBookOpen} title="The life of this soul">
    {props.state.ready ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col gap-3 text-base text-white leading-relaxed"
        style={{ color: `#ffffff !important` }}
      >
        {props.state.payload.story.split("\n\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </motion.div>
    ) : (
      <StoryLoading />
    )}

    <button
      type="button"
      disabled
      className="mystic-glass-gold-strong inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em]"
    >
      <span className="gold-text">Read the full record</span>
      <LuChevronDown size={14} className="text-[#F5B83D]" />
    </button>
  </RevealSection>
);
