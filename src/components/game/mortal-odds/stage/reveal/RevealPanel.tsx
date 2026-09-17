import { motion } from "framer-motion";
import { BetsBreakdown } from "@/components/game/mortal-odds/stage/reveal/BetsBreakdown";
import { LifespanChart } from "@/components/game/mortal-odds/stage/reveal/LifespanChart";
import { fmtYear } from "@/lib/mortal-odds/format";
import { playClickSound } from "@/utils/playClickSound";
import type { RevealResult } from "@/hooks/useMortalOddsDraw";
import type { Place } from "@/types";

export const RevealPanel = (props: { reveal: RevealResult; place: Place; currentYear: number; currency: string; onNext: () => void }) => {
  const { life, results, net, skill, story, lifespan } = props.reveal;
  const alive = life.deathYear >= props.currentYear;
  const sexLabel = life.sex === "girl" ? "A girl" : "A boy";
  const fate = alive ? `${sexLabel}, still living` : life.age === 0 ? `${sexLabel}, gone within a year` : `${sexLabel}, dead at ${life.age}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-4"
    >
      <h3 className="font-bold text-lg text-white">{fate}</h3>

      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-white/50 text-xs">Born</dt>
          <dd className="font-semibold text-white">
            {fmtYear(life.year)}, {props.place.name}
          </dd>
        </div>
        <div>
          <dt className="text-white/50 text-xs">{alive ? "Projected death" : "Died"}</dt>
          <dd className="font-semibold text-white">{fmtYear(life.deathYear)}</dd>
        </div>
        <div>
          <dt className="text-white/50 text-xs">Cause</dt>
          <dd className="font-semibold text-white">{life.shock ? life.shock.label : "Ordinary life and death"}</dd>
        </div>
      </dl>

      <p className="text-sm text-white/70">{story}</p>

      <div>
        <p className="mb-1 flex gap-3 text-white/50 text-xs">
          <span>Age at death, people born there and then:</span>
          <span className="text-[#9181F0]">— Real</span>
          <span className="text-[#F5B83D]">- - Bookie assumed</span>
        </p>
        <LifespanChart histogram={lifespan} deathAge={life.age} />
      </div>

      {results.length > 0 ? (
        <>
          <BetsBreakdown results={results} currency={props.currency} />
          <p className="text-white/50 text-xs">
            Skill {skill >= 0 ? "+" : "−"}
            {Math.abs(Math.round(skill))} pts. Skill is what your bets were worth at the real odds, so a smart bet that lost still
            scores and a lucky one does not.
          </p>
        </>
      ) : (
        <p className="text-white/50 text-sm">No bets this round. Just watching.</p>
      )}

      <p className={`font-bold text-lg ${net >= 0 ? "text-[#4ADE80]" : "text-[#F87171]"}`}>
        {net >= 0 ? "Up" : "Down"} {Math.abs(net).toFixed(2)} {props.currency}
      </p>

      <button
        type="button"
        onClick={() => {
          playClickSound();
          props.onNext();
        }}
        className="purple-gradient rounded-full px-6 py-3 font-bold text-white"
      >
        Next human
      </button>
    </motion.div>
  );
};
