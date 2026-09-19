import React from "react";

export const TaskIcon = ({ active = true }: { active: boolean }) => {
  return (
    <div>
      {active ? (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="0.75"
            y="1.25"
            width="23.5"
            height="24.5"
            rx="2.75"
            fill="url(#paint0_linear_314_3865)"
            stroke="#2C1B00"
            strokeWidth="0.5"
          />
          <rect x="3.5" y="5" width="18" height="2" rx="1" fill="url(#paint1_linear_314_3865)" />
          <rect x="3.5" y="10" width="18" height="2" rx="1" fill="url(#paint2_linear_314_3865)" />
          <rect x="3.5" y="15" width="18" height="2" rx="1" fill="url(#paint3_linear_314_3865)" />
          <rect x="3.5" y="20" width="18" height="2" rx="1" fill="url(#paint4_linear_314_3865)" />
          <rect
            x="1.75"
            y="0.25"
            width="23.5"
            height="24.5"
            rx="2.75"
            fill="url(#paint5_linear_314_3865)"
            stroke="#2C1B00"
            strokeWidth="0.5"
          />
          <rect x="4.5" y="4" width="18" height="2" rx="1" fill="url(#paint6_linear_314_3865)" />
          <rect x="4.5" y="9" width="18" height="2" rx="1" fill="url(#paint7_linear_314_3865)" />
          <rect x="4.5" y="14" width="18" height="2" rx="1" fill="url(#paint8_linear_314_3865)" />
          <rect x="4.5" y="19" width="18" height="2" rx="1" fill="url(#paint9_linear_314_3865)" />
          <defs>
            <linearGradient
              id="paint0_linear_314_3865"
              x1="4.06923"
              y1="4.71795"
              x2="21.6187"
              y2="21.5654"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#093833" />
              <stop offset="1" stopColor="#0A403D" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_314_3865"
              x1="6.17692"
              y1="5.29744"
              x2="6.48537"
              y2="8.07342"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFB359" />
              <stop offset="1" stopColor="#FBBB3F" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_314_3865"
              x1="6.17692"
              y1="10.2974"
              x2="6.48537"
              y2="13.0734"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFF859" />
              <stop offset="1" stopColor="#70FB3F" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_314_3865"
              x1="6.17692"
              y1="15.2974"
              x2="6.48537"
              y2="18.0734"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFF859" />
              <stop offset="1" stopColor="#70FB3F" />
            </linearGradient>
            <linearGradient
              id="paint4_linear_314_3865"
              x1="6.17692"
              y1="20.2974"
              x2="6.48537"
              y2="23.0734"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFF859" />
              <stop offset="1" stopColor="#70FB3F" />
            </linearGradient>
            <linearGradient
              id="paint5_linear_314_3865"
              x1="5.06923"
              y1="3.71795"
              x2="22.6187"
              y2="20.5654"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#093833" />
              <stop offset="1" stopColor="#0A403D" />
            </linearGradient>
            <linearGradient
              id="paint6_linear_314_3865"
              x1="7.17692"
              y1="4.29744"
              x2="7.48537"
              y2="7.07342"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFB359" />
              <stop offset="1" stopColor="#FBBB3F" />
            </linearGradient>
            <linearGradient
              id="paint7_linear_314_3865"
              x1="7.17692"
              y1="9.29744"
              x2="7.48537"
              y2="12.0734"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFB359" />
              <stop offset="1" stopColor="#FBBB3F" />
            </linearGradient>
            <linearGradient
              id="paint8_linear_314_3865"
              x1="7.17692"
              y1="14.2974"
              x2="7.48537"
              y2="17.0734"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFB359" />
              <stop offset="1" stopColor="#FBBB3F" />
            </linearGradient>
            <linearGradient
              id="paint9_linear_314_3865"
              x1="7.17692"
              y1="19.2974"
              x2="7.48537"
              y2="22.0734"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFB359" />
              <stop offset="1" stopColor="#FBBB3F" />
            </linearGradient>
          </defs>
        </svg>
      ) : (
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="25" rx="3" fill="#807C76" />
          <rect x="3" y="4" width="18" height="2" rx="1" fill="#B0ADA9" />
          <rect x="3" y="9" width="18" height="2" rx="1" fill="#B0ADA9" />
          <rect x="3" y="14" width="18" height="2" rx="1" fill="#B0ADA9" />
          <rect x="3" y="19" width="18" height="2" rx="1" fill="#B0ADA9" />
        </svg>
      )}
    </div>
  );
};
