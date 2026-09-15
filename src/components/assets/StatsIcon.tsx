import React from "react";

export const StatsIcon = ({ active = true }: { active: boolean }) => {
  return (
    <div>
      {active ? (
        <svg width="23" height="17" viewBox="0 0 23 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.5 5H13.5V8.06923V12.9308V16H8.5V12.9308V8.06923V5Z"
            fill="url(#paint0_linear_314_3866)"
            stroke="#2C1B00"
          />
          <path
            d="M0.5 8H5.5V10.1769V13.8231V16H0.5V13.8231V10.1769V8Z"
            fill="url(#paint1_linear_314_3866)"
            stroke="#2C1B00"
          />
          <path
            d="M16.5 1H21.982V5.25898V11.741V16H16.5V11.741V5.25898V1Z"
            fill="url(#paint2_linear_314_3866)"
            stroke="#2C1B00"
          />
          <defs>
            <linearGradient
              id="paint0_linear_314_3866"
              x1="8.89231"
              y1="6.28462"
              x2="15.6369"
              y2="9.65692"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFB359" />
              <stop offset="1" stopColor="#FBBB3F" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_314_3866"
              x1="0.892308"
              y1="8.83846"
              x2="6.72899"
              y2="12.7296"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFB359" />
              <stop offset="1" stopColor="#FBBB3F" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_314_3866"
              x1="16.964"
              y1="2.87949"
              x2="24.788"
              y2="6.0492"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFB359" />
              <stop offset="1" stopColor="#FBBB3F" />
            </linearGradient>
          </defs>
        </svg>
      ) : (
        <svg width="23" height="16" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 7.56923V4H8V7.56923V12.4308V16H14V12.4308V7.56923Z" fill="#807C76" />
          <path d="M6 9.67692V7H0V9.67692V13.3231V16H6V13.3231V9.67692Z" fill="#807C76" />
          <path d="M22.482 4.75898V0H16V4.75898V11.241V16H22.482V11.241V4.75898Z" fill="#807C76" />
        </svg>
      )}
    </div>
  );
};
