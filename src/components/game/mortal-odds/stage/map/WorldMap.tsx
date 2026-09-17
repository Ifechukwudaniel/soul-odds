"use client";

import { motion } from "framer-motion";
import { erasConfig, placesConfig, worldLand } from "@/lib/mortal-odds/config";
import { densityField, graticule, landPath, project } from "@/lib/mortal-odds/geo";

const VIEWPORT = { width: 1000, height: 500 };
const GRATICULE_STEP = 30;
const BLOB_RADIUS = 46;

const LAND = landPath({ rings: worldLand, viewport: VIEWPORT });
const GRID = graticule({ stepDegrees: GRATICULE_STEP, viewport: VIEWPORT });

export const WorldMap = (props: { year: number; marker: { lat: number; lon: number } | null }) => {
  const blobs = densityField({ year: props.year, erasConfig, placesConfig, viewport: VIEWPORT });
  const pin = props.marker ? project({ lon: props.marker.lon, lat: props.marker.lat, viewport: VIEWPORT }) : null;

  return (
    <svg
      viewBox={`0 0 ${VIEWPORT.width} ${VIEWPORT.height}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label="World map of where people lived"
    >
      <defs>
        <radialGradient id="mo-density">
          <stop offset="0%" stopColor="#bcd8ff" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#7aa6ff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7aa6ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mo-pin">
          <stop offset="0%" stopColor="#F5B83D" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F5B83D" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={VIEWPORT.width} height={VIEWPORT.height} fill="#070b16" />
      <path d={LAND} fill="#27344f" />

      <g style={{ mixBlendMode: "screen" }}>
        {blobs.map((blob) => (
          <circle
            key={blob.id}
            cx={blob.x}
            cy={blob.y}
            r={BLOB_RADIUS * (0.45 + blob.intensity * 0.55)}
            fill="url(#mo-density)"
            opacity={0.25 + blob.intensity * 0.75}
          />
        ))}
      </g>

      <g stroke="#8aa0c8" strokeWidth={0.5} opacity={0.14}>
        {GRID.verticals.map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={VIEWPORT.height} />
        ))}
        {GRID.horizontals.map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={VIEWPORT.width} y2={y} />
        ))}
      </g>

      {pin && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }}>
          <line x1={0} y1={pin.y} x2={VIEWPORT.width} y2={pin.y} stroke="#F5B83D" strokeWidth={0.7} opacity={0.5} />
          <line x1={pin.x} y1={0} x2={pin.x} y2={VIEWPORT.height} stroke="#F5B83D" strokeWidth={0.7} opacity={0.5} />
          <circle cx={pin.x} cy={pin.y} r={26} fill="url(#mo-pin)" />
          <motion.circle
            cx={pin.x}
            cy={pin.y}
            r={9}
            fill="none"
            stroke="#F5B83D"
            strokeWidth={1.5}
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: [0.6, 1.8], opacity: [0.9, 0] }}
            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
            style={{ transformOrigin: `${pin.x}px ${pin.y}px` }}
          />
          <circle cx={pin.x} cy={pin.y} r={4.5} fill="#FFE9B0" stroke="#F5B83D" strokeWidth={1.5} />
        </motion.g>
      )}
    </svg>
  );
};
