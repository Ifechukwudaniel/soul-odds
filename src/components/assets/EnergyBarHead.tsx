import React from "react";
import { IconProps } from "@/types/icontypes";

export const EnergyBarHead: React.FC<IconProps> = ({
  width,
  height,
  className,
}) => {
  return (
    <svg
      style={{
        width,
        height,
      }}
      viewBox="0 0 35 35"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_577_5058)">
        <path
          d="M32.0657 20.4343C33.6863 12.3899 28.4787 4.55485 20.4343 2.93428C12.3899 1.3137 4.55489 6.52123 2.93432 14.5656C1.31374 22.61 6.52128 30.4451 14.5657 32.0657C22.6101 33.6862 30.4451 28.4787 32.0657 20.4343Z"
          fill="url(#paint0_linear_577_5058)"
        />
        <path
          d="M27.5339 19.6895C28.7355 14.1693 25.2345 8.72011 19.7142 7.51852C14.1939 6.31692 8.7448 9.8179 7.5432 15.3382C6.34161 20.8584 9.84258 26.3076 15.3628 27.5092C20.8831 28.7108 26.3323 25.2098 27.5339 19.6895Z"
          fill="url(#paint1_linear_577_5058)"
        />
        <path
          d="M17.5168 25.9988C22.208 25.9988 26.0109 22.1959 26.0109 17.5047C26.0109 12.8135 22.208 9.0105 17.5168 9.0105C12.8256 9.0105 9.02257 12.8135 9.02257 17.5047C9.02257 22.1959 12.8256 25.9988 17.5168 25.9988Z"
          fill="url(#paint2_linear_577_5058)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_577_5058"
          x1="6.9952"
          y1="7.00768"
          x2="28.0098"
          y2="28.0223"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FCB44C" />
          <stop offset="1" stopColor="#EA8124" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_577_5058"
          x1="7.31576"
          y1="17.4867"
          x2="27.7693"
          y2="17.4867"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E88725" />
          <stop offset="1" stopColor="#CC6119" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_577_5058"
          x1="11.5111"
          y1="11.499"
          x2="23.5276"
          y2="23.5155"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FCB44C" />
          <stop offset="1" stopColor="#EA8124" />
        </linearGradient>
        <clipPath id="clip0_577_5058">
          <rect width="35" height="35" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
