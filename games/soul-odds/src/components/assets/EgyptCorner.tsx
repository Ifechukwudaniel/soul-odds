import { useId } from 'react';
import type { IconProps } from '@/types/icontypes';

/**
 * A corner ornament in the Egyptian manner: fading double rails along both edges, a stepped
 * (ziggurat) bracket and a small diamond. Drawn for the top-left; mirror it with `-scale-x-100`,
 * `-scale-y-100` or both for the other corners. The rails are thin filled bars, not strokes: an SVG
 * gradient can't paint a perfectly straight line.
 */
export const EgyptCorner = (props: IconProps) => {
  const uid = useId().replaceAll(':', '');

  return (
    <svg
      width={props.width ?? 72}
      height={props.height ?? 72}
      className={props.className}
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* ✦ Same stops as .gold-text-2, running along the corner's diagonal so it catches light like the rest of the gold. */}
        <linearGradient
          id={`${uid}-gold`}
          x1="0"
          y1="0"
          x2="72"
          y2="72"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FFEDCE" />
          <stop offset="0.41" stopColor="#F0C868" />
          <stop offset="0.75" stopColor="#D09A5D" />
          <stop offset="1" stopColor="#E5B864" />
        </linearGradient>
        <linearGradient
          id={`${uid}-fade-x`}
          x1="0"
          y1="0"
          x2="72"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F0C868" />
          <stop offset="1" stopColor="#F0C868" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${uid}-fade-y`}
          x1="0"
          y1="0"
          x2="0"
          y2="72"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F0C868" />
          <stop offset="1" stopColor="#F0C868" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer rails, thick, fading away from the corner */}
      <rect x="0" y="0" width="72" height="2.5" fill={`url(#${uid}-fade-x)`} />
      <rect x="0" y="0" width="2.5" height="72" fill={`url(#${uid}-fade-y)`} />

      {/* Inner rails, fine, shorter, set in from the outer ones */}
      <rect x="7" y="7" width="44" height="1.2" fill={`url(#${uid}-fade-x)`} opacity="0.75" />
      <rect x="7" y="7" width="1.2" height="44" fill={`url(#${uid}-fade-y)`} opacity="0.75" />

      {/* Stepped bracket: three descending steps on each arm */}
      <path
        d="M13 13 H37 V16.5 H30 V19.5 H24 V22.5 H19 V29 H16.5 V35 H13.5 V41 H10.5 V47 H13 Z"
        fill={`url(#${uid}-gold)`}
        opacity="0.95"
      />

      {/* Diamond where the rails meet, with a highlight */}
      <path d="M13 6.5 L19.5 13 L13 19.5 L6.5 13 Z" fill={`url(#${uid}-gold)`} />
      <path d="M13 9.5 L16 13 L13 16.5 L10 13 Z" fill="#7a5a1f" opacity="0.55" />

      {/* Small studs following the rails */}
      <circle cx="46" cy="13" r="1.4" fill="#F0C868" opacity="0.7" />
      <circle cx="13" cy="46" r="1.4" fill="#F0C868" opacity="0.7" />
    </svg>
  );
};
