"use client";

import { motion } from "framer-motion";
import { WorldMap } from "@/components/game/mortal-odds/stage/map/WorldMap";
import { fmtYear } from "@/lib/mortal-odds/format";
import type { Place } from "@/types";

export const WhereSlide = (props: { year: number; place: Place; local: string }) => (
  <div className="flex h-full flex-col items-center gap-3 text-center">
    <div className="shrink-0">
      <h3 className="font-bold text-white text-xl">Where in the world?</h3>
      <p className="mt-1 max-w-lg text-sm text-white/50">
        Where people lived in {fmtYear(props.year)}. Brighter clusters held more people.
      </p>
    </div>

    <div className="flex min-h-0 w-full flex-1 items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="aspect-2/1 h-full max-w-full overflow-hidden rounded-lg border border-white/10"
      >
        <WorldMap year={props.year} marker={{ lat: props.place.lat, lon: props.place.lon }} />
      </motion.div>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.5 }}
      className="shrink-0"
    >
      <p className="font-bold text-white text-xl">
        {props.place.name}
        <span className="font-medium text-sm text-white/40"> · {props.place.continent}</span>
      </p>
      <p className="mt-0.5 text-sm text-white/60">{props.local}</p>
    </motion.div>
  </div>
);
