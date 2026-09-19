import React from "react";
import { IconProps } from "@/types/icontypes";

export const SpeedBoostIcon: React.FC<IconProps> = ({ width, height, className }) => {
  return (
    <svg
      style={{
        width,
        height,
      }}
      className={className}
      viewBox="0 0 36 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M30.5253 6.25117H4.75197C2.12753 6.25117 0 8.3787 0 11.0031V27.248C0 29.8725 2.12753 32 4.75197 32H30.5253C33.1497 32 35.2773 29.8725 35.2773 27.248V11.0031C35.2773 8.3787 33.1497 6.25117 30.5253 6.25117Z"
        fill="url(#paint0_linear_255_2809)"
      />
      <path d="M35.2773 11.9926H0V13.1977H35.2773V11.9926Z" fill="url(#paint1_linear_255_2809)" />
      <path
        d="M22.8925 19.2284H19.767V16.1029H15.5098V19.2284H12.3843V23.4856H15.5098V26.6111H19.767V23.4856H22.8925V19.2284Z"
        fill="url(#paint2_linear_255_2809)"
      />
      <path
        d="M23.6128 0H11.6692C11.2132 0 10.7758 0.181159 10.4533 0.503633C10.1309 0.826107 9.94971 1.26348 9.94971 1.71952V6.27064H12.2179V2.26331H23.0691V6.26574H25.3324V1.71463C25.3311 1.25943 25.1493 0.823314 24.827 0.501899C24.5047 0.180484 24.068 -1.84738e-06 23.6128 0Z"
        fill="url(#paint3_linear_255_2809)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_255_2809"
          x1="1.34231"
          y1="2.82682"
          x2="33.8517"
          y2="35.3362"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DD4747" />
          <stop offset="1" stopColor="#C42626" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_255_2809"
          x1="0"
          y1="12.5903"
          x2="35.2773"
          y2="12.5903"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#843317" />
          <stop offset="0.67" stopColor="#782B13" />
          <stop offset="1" stopColor="#702511" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_255_2809"
          x1="13.947"
          y1="17.6656"
          x2="21.3297"
          y2="25.0483"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FCB44C" />
          <stop offset="1" stopColor="#EA8124" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_255_2809"
          x1="9.94971"
          y1="3.13532"
          x2="25.3275"
          y2="3.13532"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#843317" />
          <stop offset="0.67" stopColor="#782B13" />
          <stop offset="1" stopColor="#702511" />
        </linearGradient>
      </defs>
    </svg>
  );
};
