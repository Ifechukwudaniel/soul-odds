import { motion } from "framer-motion";
import type { BetResult } from "@/types";

export const BetsBreakdown = (props: { results: BetResult[]; currency: string; visibleCount: number }) => (
  <div className="overflow-x-auto">
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
        {props.results.slice(0, props.visibleCount).map((r) => (
          <motion.tr
            key={r.marketId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="border-t border-white/10"
          >
            <td className="py-2 text-white/70">{r.marketLabel}</td>
            <td className="py-2 font-semibold text-white">{r.pickLabel}</td>
            <td className="py-2 text-white/70">{r.outcomeLabel}</td>
            <td className="py-2 text-right text-white/50">{Math.round(r.bookieP * 100)}%</td>
            <td className="py-2 text-right text-white/50">{Math.round(r.realP * 100)}%</td>
            <td className={`py-2 text-right font-bold ${r.net >= 0 ? "text-[#4ADE80]" : "text-[#F87171]"}`}>
              {r.net >= 0 ? "+" : "−"}
              {Math.abs(r.net).toFixed(2)}
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
);
