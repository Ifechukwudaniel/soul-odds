'use client';

import { motion, useMotionValue, animate as animateValue } from 'framer-motion';
import { useEffect, useState } from 'react';
import { erasConfig, placesConfig, worldLand } from '@/lib/mortal-odds/config';
import { densityField, graticule, landPath, project } from '@/lib/mortal-odds/geo';
import { playSound } from '@/utils/playSound';

const VIEWPORT = { width: 1000, height: 500 };
const GRATICULE_STEP = 30;
const BLOB_RADIUS = 46;
const MAP_MARGIN = 60;

export const ROAM_DURATION = 2;
const ROAM_STOPS = 6;

const LAND = landPath({ rings: worldLand, viewport: VIEWPORT });
const GRID = graticule({ stepDegrees: GRATICULE_STEP, viewport: VIEWPORT });

const randomPoint = () => ({
  x: MAP_MARGIN + Math.random() * (VIEWPORT.width - MAP_MARGIN * 2),
  y: MAP_MARGIN + Math.random() * (VIEWPORT.height - MAP_MARGIN * 2),
});

export const WorldMap = (props: { year: number; marker: { lat: number; lon: number } | null }) => {
  const blobs = densityField({ year: props.year, erasConfig, placesConfig, viewport: VIEWPORT });
  const pin = props.marker
    ? project({ lon: props.marker.lon, lat: props.marker.lat, viewport: VIEWPORT })
    : null;

  const pinX = useMotionValue(pin?.x ?? VIEWPORT.width / 2);
  const pinY = useMotionValue(pin?.y ?? VIEWPORT.height / 2);
  const [settled, setSettled] = useState(!pin);

  useEffect(() => {
    if (!pin) return;
    setSettled(false);

    const waypoints = Array.from({ length: ROAM_STOPS }, randomPoint);
    const xs = [pinX.get(), ...waypoints.map((w) => w.x), pin.x];
    const ys = [pinY.get(), ...waypoints.map((w) => w.y), pin.y];
    // ease into the final stop more slowly than the frantic jumps before it
    const times = xs.map((_, i) => (i === xs.length - 1 ? 1 : (i / (xs.length - 1)) * 0.85));

    const cx = animateValue(pinX, xs, { duration: ROAM_DURATION, times, ease: 'easeInOut' });
    const cy = animateValue(pinY, ys, { duration: ROAM_DURATION, times, ease: 'easeInOut' });
    // A tock as the pin reaches each waypoint (the first and last stops are the start and the landing), then a chime as it lands.
    const ticks = times
      .slice(1, -1)
      .map((time, step) =>
        setTimeout(() => playSound({ name: 'search-tick', step }), time * ROAM_DURATION * 1000),
      );
    const t = setTimeout(() => {
      setSettled(true);
      playSound({ name: 'search-lock' });
    }, ROAM_DURATION * 1000);

    return () => {
      cx.stop();
      cy.stop();
      ticks.forEach(clearTimeout);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.marker?.lat, props.marker?.lon]);

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
          <stop offset="0%" stopColor="#a8e8d8" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#5fc9b8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#5fc9b8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mo-pin">
          <stop offset="0%" stopColor="#F5B83D" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F5B83D" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={VIEWPORT.width} height={VIEWPORT.height} fill="#081514" />
      <path d={LAND} fill="#1f3d3a" />

      <g style={{ mixBlendMode: 'screen' }}>
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

      <g stroke="#7fb0a8" strokeWidth={0.5} opacity={0.14}>
        {GRID.verticals.map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={VIEWPORT.height} />
        ))}
        {GRID.horizontals.map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={VIEWPORT.width} y2={y} />
        ))}
      </g>

      {pin && !settled && (
        <>
          <motion.circle cx={pinX} cy={pinY} r={5} fill="#F5B83D" opacity={0.9} />
          <motion.circle
            cx={pinX}
            cy={pinY}
            r={13}
            fill="none"
            stroke="#F5B83D"
            strokeWidth={1}
            opacity={0.45}
            animate={{ scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 0.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            style={{ transformOrigin: 'center' }}
          />
        </>
      )}

      {pin && settled && (
        <motion.g
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'backOut' }}
          style={{ transformOrigin: `${pin.x}px ${pin.y}px` }}
        >
          <line
            x1={0}
            y1={pin.y}
            x2={VIEWPORT.width}
            y2={pin.y}
            stroke="#F5B83D"
            strokeWidth={0.7}
            opacity={0.5}
          />
          <line
            x1={pin.x}
            y1={0}
            x2={pin.x}
            y2={VIEWPORT.height}
            stroke="#F5B83D"
            strokeWidth={0.7}
            opacity={0.5}
          />
          <circle cx={pin.x} cy={pin.y} r={26} fill="url(#mo-pin)" />
          <motion.circle
            cx={pin.x}
            cy={pin.y}
            r={9}
            fill="none"
            stroke="#F5B83D"
            strokeWidth={1.5}
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: [0.6, 1.8], opacity: [0.9, 0] }}
            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeOut' }}
            style={{ transformOrigin: `${pin.x}px ${pin.y}px` }}
          />
          <circle cx={pin.x} cy={pin.y} r={4.5} fill="#FFE9B0" stroke="#F5B83D" strokeWidth={1.5} />
        </motion.g>
      )}
    </svg>
  );
};
