import { LuBookOpen, LuChevronDown } from "react-icons/lu";
import { RevealSection } from "@/components/game/mortal-odds/stage/reveal/RevealSection";

/** The narrative of the soul's life; blank lines in `story` become paragraph breaks. */
export const SoulStory = (props: { story: string }) => (
  <RevealSection icon={LuBookOpen} title="The life of this soul">
    <div className="flex flex-col gap-3 text-base text-white/80 leading-relaxed">
      {props.story.split("\n\n").map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>

    <button
      type="button"
      disabled
      className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-full border border-[#F5B83D]/40 px-4 py-1.5 font-semibold text-[#F5B83D] text-xs uppercase tracking-[0.12em] opacity-40"
    >
      Read the full record
      <LuChevronDown size={14} />
    </button>
  </RevealSection>
);
