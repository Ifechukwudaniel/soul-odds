import { useId } from 'react';

// =====================================
// ⬢ Corner ornament for framing a panel from the inside
// =====================================

const GOLD_STOPS = (
  <>
    <stop offset="0" stopColor="#FFEDCE" />
    <stop offset="0.41" stopColor="#F0C868" />
    <stop offset="0.75" stopColor="#D09A5D" />
    <stop offset="1" stopColor="#E5B864" />
  </>
);

/** A compact stepped (ziggurat) bracket with fading rails. Drawn top-left, 40 x 40. */
const ZigguratCorner = (props: { className?: string }) => {
  const uid = useId().replaceAll(':', '');

  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      className={props.className}
      fill="none"
    >
      <defs>
        <linearGradient
          id={`${uid}-g`}
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          {GOLD_STOPS}
        </linearGradient>
        <linearGradient
          id={`${uid}-fx`}
          x1="0"
          y1="0"
          x2="40"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F0C868" />
          <stop offset="1" stopColor="#F0C868" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${uid}-fy`}
          x1="0"
          y1="0"
          x2="0"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F0C868" />
          <stop offset="1" stopColor="#F0C868" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* ✦ Rails are thin filled bars: an SVG gradient can't paint a perfectly straight stroke. */}
      <rect x="0" y="0" width="40" height="1.6" fill={`url(#${uid}-fx)`} />
      <rect x="0" y="0" width="1.6" height="40" fill={`url(#${uid}-fy)`} />
      <path d="M6 6 H26 V8.6 H20 V11.2 H14 V14 H11.2 V20 H8.6 V26 H6 Z" fill={`url(#${uid}-g)`} />
      <circle cx="32" cy="6.8" r="1.2" fill="#F0C868" opacity="0.7" />
      <circle cx="6.8" cy="32" r="1.2" fill="#F0C868" opacity="0.7" />
    </svg>
  );
};

/**
 * Corner ornaments drawn just inside the edge of a `relative` panel, for framing it from the inside.
 * One drawing, mirrored to all four corners. Sits over the panel and lets clicks through.
 */
export const FrameOrnaments = (props: { className?: string }) => {
  const size = props.className ?? 'w-8 md:w-10';

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      <ZigguratCorner className={`absolute top-1.5 left-1.5 ${size}`} />
      <ZigguratCorner className={`absolute top-1.5 right-1.5 -scale-x-100 ${size}`} />
      <ZigguratCorner className={`absolute bottom-1.5 left-1.5 -scale-y-100 ${size}`} />
      <ZigguratCorner className={`absolute right-1.5 bottom-1.5 -scale-100 ${size}`} />
    </div>
  );
};
