import type { IconType } from "react-icons";
import { LuBookOpen, LuBuilding2, LuCalendar, LuHeartPulse, LuMapPin } from "react-icons/lu";
import { RevealSection } from "@/components/game/mortal-odds/stage/reveal/RevealSection";
import { fmtYear } from "@/lib/mortal-odds/format";
import { getMarketIcon } from "@/lib/mortal-odds/market-icons";
import type { Life } from "@/types";

type RecordRow = { icon: IconType; label: string; value: string };

function lifespanLabel(age: number): string {
  if (age === 0) return "Under a year";
  return age === 1 ? "1 year" : `${age} years`;
}

const RecordGroup = (props: { rows: RecordRow[] }) => (
  <dl className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
    {props.rows.map((row) => (
      <div key={row.label} className="flex items-center justify-between gap-3">
        <dt className="flex items-center gap-2 text-[11px] text-white/50 uppercase tracking-[0.15em]">
          <row.icon size={14} className="text-[#F5B83D]" />
          {row.label}
        </dt>
        <dd className="text-right text-sm text-white">{row.value}</dd>
      </div>
    ))}
  </dl>
);

/** The soul's vital facts, grouped into born/place, death/lifespan, upbringing and sin/cause. */
export const SoulRecord = (props: { life: Life; placeName: string; alive: boolean }) => {
  const { life } = props;
  const groups: RecordRow[][] = [
    [
      { icon: LuCalendar, label: "Born", value: fmtYear(life.year) },
      { icon: LuMapPin, label: "Place", value: props.placeName },
    ],
    [
      { icon: getMarketIcon("dy"), label: props.alive ? "Projected death" : "Died", value: fmtYear(life.deathYear) },
      { icon: getMarketIcon("age"), label: "Lifespan", value: lifespanLabel(life.age) },
    ],
    [
      { icon: LuBookOpen, label: "Literacy", value: life.literate ? "Yes" : "No" },
      { icon: LuBuilding2, label: "Lived in a city", value: life.city ? "Yes" : "No" },
    ],
    [
      { icon: getMarketIcon("sins"), label: "Sin", value: life.sin ? life.sin.label : "Clean" },
      { icon: LuHeartPulse, label: "Cause", value: life.shock ? life.shock.label : "Ordinary life and death" },
    ],
  ];

  return (
    <RevealSection icon={getMarketIcon("dy")} title="Soul record">
      <div className="flex flex-col divide-y divide-white/10 rounded-xl border border-white/10 bg-black/30 p-3">
        {groups.map((rows) => (
          <RecordGroup key={rows[0]?.label} rows={rows} />
        ))}
      </div>
    </RevealSection>
  );
};
