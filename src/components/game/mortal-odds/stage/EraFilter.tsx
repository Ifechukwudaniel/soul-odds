import { playClickSound } from "@/utils/playClickSound";
import type { EraFilter as EraFilterId } from "@/types";

const ERAS: ReadonlyArray<{ id: EraFilterId; label: string }> = [
  { id: "all", label: "All of history" },
  { id: "ce", label: "Since year 1" },
  { id: "modern", label: "Since 1750" },
];

export const EraFilter = (props: { activeEra: EraFilterId; disabled: boolean; onSelect: (era: EraFilterId) => void }) => (
  <div
    className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/60 p-1"
    role="group"
    aria-label="Which humans can be drawn"
  >
    {ERAS.map((era) => (
      <button
        type="button"
        key={era.id}
        disabled={props.disabled}
        aria-pressed={props.activeEra === era.id}
        onClick={() => {
          playClickSound();
          props.onSelect(era.id);
        }}
        className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
          props.activeEra === era.id
            ? "border border-[#6752EF] bg-[#6752EF]/10 text-[#9181F0]"
            : "border border-transparent text-white/60"
        }`}
      >
        {era.label}
      </button>
    ))}
  </div>
);
