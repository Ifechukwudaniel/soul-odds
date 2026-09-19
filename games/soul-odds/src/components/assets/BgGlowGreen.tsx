import React from "react";
import { CSSProperties } from "react";

export const BgGlowGreen = ({ className, styles }: { className?: string; styles?: CSSProperties }) => {
  return (
    <svg
      width="393"
      height="723"
      viewBox="0 0 393 723"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={styles}
    >
      <g filter="url(#filter0_f_349_5949)">
        <circle cx="196" cy="358" r="140" fill="#30B5B5" />
      </g>
      <defs>
        <filter
          id="filter0_f_349_5949"
          x="-168.575"
          y="-6.57523"
          width="729.15"
          height="729.15"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="112.288" result="effect1_foregroundBlur_349_5949" />
        </filter>
      </defs>
    </svg>
  );
};
