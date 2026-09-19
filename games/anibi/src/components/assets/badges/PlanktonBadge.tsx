import React from "react";

export const PlanktonBadge = ({
  unlocked = false,
  width,
  height,
}: {
  unlocked: boolean;
  width?: string | number;
  height?: string | number;
}) => {
  return (
    <div>
      {!unlocked ? (
        <svg
          viewBox="0 0 85 85"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width,
            height,
          }}
        >
          <circle cx="42.5" cy="42.5" r="42.5" fill="url(#paint0_linear_251_2004)" />
          <g filter="url(#filter0_i_251_2004)">
            <circle cx="42.5" cy="42.5" r="27.625" fill="url(#paint1_radial_251_2004)" />
            <circle
              cx="42.5"
              cy="42.5"
              r="27.625"
              fill="url(#paint2_linear_251_2004)"
              fillOpacity="0.2"
              style={{ mixBlendMode: "multiply" }}
            />
          </g>
          <circle cx="42.5" cy="42.5" r="30.2812" stroke="url(#paint3_linear_251_2004)" strokeWidth="5.3125" />
          <g style={{ mixBlendMode: "overlay" }} opacity="0.25">
            <circle cx="42.5" cy="42.5" r="33.2031" stroke="white" strokeWidth="0.53125" />
          </g>
          <defs>
            <filter
              id="filter0_i_251_2004"
              x="9.5625"
              y="9.5625"
              width="65.875"
              height="65.875"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="11.9531" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.358333 0 0 0 0 0.0840788 0 0 0 0 0.0627083 0 0 0 1 0" />
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow_251_2004" />
            </filter>
            <linearGradient
              id="paint0_linear_251_2004"
              x1="42.5"
              y1="0"
              x2="42.5"
              y2="85"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#524234" />
              <stop offset="1" stopColor="#715041" />
            </linearGradient>
            <radialGradient
              id="paint1_radial_251_2004"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(42.5 42.5) rotate(90) scale(43.0313)"
            >
              <stop stopColor="#4C392D" />
              <stop offset="1" stopColor="#452D1F" />
            </radialGradient>
            <linearGradient
              id="paint2_linear_251_2004"
              x1="42.5"
              y1="14.875"
              x2="42.5"
              y2="70.125"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopOpacity="0" />
              <stop offset="1" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_251_2004"
              x1="42.5"
              y1="14.875"
              x2="42.5"
              y2="70.125"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#463111" />
              <stop offset="1" stopColor="#564936" />
            </linearGradient>
          </defs>
        </svg>
      ) : (
        <svg width="85" height="85" viewBox="0 0 85 85" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="42.5" cy="42.5" r="42.5" fill="url(#paint0_linear_251_2004)" />
          <g filter="url(#filter0_i_251_2004)">
            <circle cx="42.5" cy="42.5" r="27.625" fill="url(#paint1_radial_251_2004)" />
            <circle
              cx="42.5"
              cy="42.5"
              r="27.625"
              fill="url(#paint2_linear_251_2004)"
              fillOpacity="0.2"
              style={{ mixBlendMode: "multiply" }}
            />
          </g>
          <circle cx="42.5" cy="42.5" r="30.2812" stroke="url(#paint3_linear_251_2004)" strokeWidth="5.3125" />
          <g style={{ mixBlendMode: "overlay" }} opacity="0.25">
            <circle cx="42.5" cy="42.5" r="33.2031" stroke="white" strokeWidth="0.53125" />
          </g>
          <defs>
            <filter
              id="filter0_i_251_2004"
              x="9.5625"
              y="9.5625"
              width="65.875"
              height="65.875"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="11.9531" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.358333 0 0 0 0 0.0840788 0 0 0 0 0.0627083 0 0 0 1 0" />
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow_251_2004" />
            </filter>
            <linearGradient
              id="paint0_linear_251_2004"
              x1="42.5"
              y1="0"
              x2="42.5"
              y2="85"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#524234" />
              <stop offset="1" stopColor="#715041" />
            </linearGradient>
            <radialGradient
              id="paint1_radial_251_2004"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(42.5 42.5) rotate(90) scale(43.0313)"
            >
              <stop stopColor="#4C392D" />
              <stop offset="1" stopColor="#452D1F" />
            </radialGradient>
            <linearGradient
              id="paint2_linear_251_2004"
              x1="42.5"
              y1="14.875"
              x2="42.5"
              y2="70.125"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopOpacity="0" />
              <stop offset="1" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_251_2004"
              x1="42.5"
              y1="14.875"
              x2="42.5"
              y2="70.125"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#463111" />
              <stop offset="1" stopColor="#564936" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
};
