"use client";

import { motion } from "framer-motion";
import { PiArrowsClockwise } from "react-icons/pi";
import { CurrencyCoinIcon } from "@/components/assets/CurrencyCoinIcon";
import { InfoDialog } from "@/components/game/InfoDialog";
import { LAND_INFO } from "@/components/game/mortal-odds/stage/draw/slide-info";
import { ROAM_DURATION, WorldMap } from "@/components/game/mortal-odds/stage/map/WorldMap";
import { fmtYear } from "@/lib/mortal-odds/format";
import type { Place } from "@/types";
import { serifFont } from "@/styles/serif-font";
const MAP_SOURCES =
  "Sources: Klein Goldewijk et al. (S06); United Nations DESA (RH05); Reba (RH32); GeoNames geographical database (RH33); McEvedy (RH11); Bae (RH16); Model-supplied gap-fill (Claude Fable 5 and Claude Opus 5 (RH109)";

export const WhereSlide =(props: { year: number; place: Place; where: string; local: string; onRedraw: () => void; drawCost: number; canAffordDraw: boolean }) => (
  <div className="flex h-full flex-col items-center gap-3 overflow-hidden text-center">
    <div className="shrink-0">
      <div className="flex items-center justify-center gap-3">
        <h3 className={`${serifFont.className} font-bold text-3xl text-[#F1D6AE] sm:text-4xl leading-[0.75] pt-[0.5rem]`}>In which land?</h3>
        <InfoDialog {...LAND_INFO} />
      </div>
      <p className="mt-1 max-w-lg text-sm text-[0.8rem] text-[#f1f1f2c0]">
        Where people lived in {fmtYear(props.year)}. Brighter clusters held more people.
      </p>
    </div>

    <div className="flex min-h-0 w-full flex-1 items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="aspect-2/1 h-full max-w-full overflow-hidden  rounded-lg border border-[#FDE991]/15 relative"
      >

        <WorldMap year={props.year} marker={{ lat: props.place.lat, lon: props.place.lon }} />
        <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/50 px-2 py-0.5 text-left text-[0.5rem] leading-tight text-[#f1f1f2a0] sm:text-[0.6rem]">
          {MAP_SOURCES}
        </p>
      </motion.div>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: ROAM_DURATION + 0.15 }}
      className="shrink-0"
    >
      <div className="flex items-center justify-center gap-2">
        <p className="font-bold text-white text-xl">{props.where}</p>
        <button
          type="button"
          aria-label={props.drawCost > 0 ? `Redraw the land for ${props.drawCost} deben` : "Redraw the land for free"}
          title={props.drawCost > 0 ? `Redraw the land for ${props.drawCost} deben` : "Redraw the land for free"}
          disabled={!props.canAffordDraw}
          onClick={props.onRedraw}
          className="group flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[#DEAE56] text-xs disabled:opacity-30"
        >
          <PiArrowsClockwise className="h-3.5 w-3.5 transition-transform duration-150 group-hover:rotate-180" />
          {props.drawCost > 0 && <CurrencyCoinIcon width={12} height="12" />}
          {props.drawCost > 0 ? props.drawCost : "Free"}
        </button>
      </div>
      <p className="mt-0.5 text-[0.8rem] text-[#f1f1f2c0]">{props.local}</p>
    </motion.div>
  </div>
);