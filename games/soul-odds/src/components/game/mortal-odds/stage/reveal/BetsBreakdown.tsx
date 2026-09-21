import { motion } from "framer-motion";
import { Scroller } from "@/components/Scroller";
import { RevealStamp } from "@/components/game/mortal-odds/stage/reveal/RevealStamp";
import type { BetResult } from "@/types";

export const BetsBreakdown = (props: { results: BetResult[]; currency: string; visibleCount: number }) => (
  <Scroller horizontal>
    <table className="w-full min-w-[460px] text-sm">
      <thead>
        <tr className="text-left text-white/50 text-xs">
          <th className="pb-2 font-normal">Bet</th>
          <th className="pb-2 font-normal">Your pick</th>
          <th className="pb-2 font-normal">Result</th>
          <th className="pb-2 text-right font-normal">Bookie</th>
          <th className="pb-2 text-right font-normal">Real</th>
          <th className="pb-2 text-right font-normal">{props.currency}</th>
        </tr>
      </thead>
      <tbody>
        {props.results.slice(0, props.visibleCount).map((r, index) => (
          <motion.tr
            key={r.marketId}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="border-t border-white/10"
          >
            <td className="py-2 text-white/70">{r.marketLabel}</td>
            <td className="py-2 font-semibold text-white">{r.pickLabel}</td>
            <td className="py-2 text-white/70">{r.outcomeLabel}</td>
            <td className="py-2 text-right text-white/50">{Math.round(r.bookieP * 100)}%</td>
            <td className="py-2 text-right text-white/50">{Math.round(r.realP * 100)}%</td>
            <td className="py-2 text-right">
              <RevealStamp tone={r.net >= 0 ? "win" : "loss"} rotate={index % 2 === 0 ? -4 : 4}>
                {r.net >= 0 ? "Won" : "Lost"}
              </RevealStamp>
              <div className={`mt-1 font-bold ${r.net >= 0 ? "text-[#6BA84F]" : "text-[#B7410E]"}`}>
                {r.net >= 0 ? "+" : "−"}
                {Math.abs(r.net).toFixed(2)}
              </div>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </Scroller>
);
