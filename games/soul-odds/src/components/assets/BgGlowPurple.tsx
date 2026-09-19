import React from "react";
import { CSSProperties } from "react";

export const BgGlowPurple = ({ className, styles }: { className?: string; styles?: CSSProperties }) => {
  return (
    <svg
      width="393"
      height="743"
      viewBox="0 0 393 743"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={styles}
    >
      <g filter="url(#filter0_f_349_7825)">
        <circle cx="196" cy="351.057" r="167" fill="#5130B5" />
      </g>
      <defs>
        <filter
          id="filter0_f_349_7825"
          x="-195.575"
          y="-40.5181"
          width="783.15"
          height="783.15"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="112.288" result="effect1_foregroundBlur_349_7825" />
        </filter>
      </defs>
    </svg>
  );
};
