import { LuBookOpen, LuChevronDown } from "react-icons/lu";
import { RevealSection } from "@/components/game/mortal-odds/stage/reveal/RevealSection";

/** The narrative of the soul's life; blank lines in `story` become paragraph breaks. */
export const SoulStory = (props: { story: string }) => (
  <RevealSection icon={LuBookOpen} title="The life of this soul">
    <div className="flex flex-col gap-3 text-base text-white leading-relaxed" style={{color: `#ffffff !important` }}>
      {props.story.split("\n\n").map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>

    <button
  type="button"
  disabled
  className="mystic-glass-gold-strong inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em]"
>
  <span className="gold-text">
    Read the full record
  </span>

  <LuChevronDown size={14} className="text-[#F5B83D]" />
</button>
  </RevealSection>
);
