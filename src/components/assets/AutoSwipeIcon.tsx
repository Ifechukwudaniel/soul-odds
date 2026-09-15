import React from "react";
import { IconProps } from "@/types/icontypes";

export const AutoSwipeIcon: React.FC<IconProps> = ({ width, height, className }) => {
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
        d="M8.90105 0.582825C8.24197 0.962098 7.69502 1.50906 7.31574 2.16814L0.578169 13.8248C0.198756 14.4844 -0.000625185 15.2321 1.47265e-06 15.993H17.8068L8.90105 0.582825Z"
        fill="url(#paint0_linear_255_3177)"
      />
      <path
        d="M35.6139 15.9976C35.6145 15.2367 35.4151 14.489 35.0357 13.8295L28.2981 2.1728C27.9221 1.5132 27.3784 0.964686 26.7221 0.582825L17.8164 16.0023L35.6139 15.9976Z"
        fill="url(#paint1_linear_255_3177)"
      />
      <path
        d="M17.8071 15.9977L26.7221 0.58286C26.0637 0.200172 25.3155 -0.000950608 24.554 2.5468e-05H11.0788C10.3141 -0.00260499 9.56252 0.198574 8.90137 0.58286L17.8071 16.0023V15.9977Z"
        fill="url(#paint2_linear_255_3177)"
      />
      <path
        d="M28.2977 29.8319L35.0352 18.1752C35.4146 17.5156 35.614 16.7679 35.6134 16.007H17.8066L26.7217 31.4218C27.3766 31.0382 27.9199 30.4901 28.2977 29.8319Z"
        fill="url(#paint3_linear_255_3177)"
      />
      <path
        d="M8.90137 31.4218C9.561 31.801 10.3086 32.0004 11.0695 32H24.5447C25.3087 32.002 26.0597 31.8026 26.7221 31.4218L17.8164 15.9977L8.90137 31.4218Z"
        fill="url(#paint4_linear_255_3177)"
      />
      <path
        d="M17.8068 15.9977H1.47265e-06C-0.000625185 16.7586 0.198756 17.5063 0.578169 18.1658L7.31574 29.8225C7.69613 30.482 8.24273 31.0302 8.90105 31.4125L17.8068 15.9883V15.9977Z"
        fill="url(#paint5_linear_255_3177)"
      />
      <path
        d="M20.4974 8.56531H15.1166C14.6292 8.56907 14.1512 8.70011 13.73 8.94547C13.3088 9.19082 12.9591 9.54197 12.7154 9.96411L10.025 14.6268C9.78461 15.0487 9.6582 15.526 9.6582 16.0116C9.6582 16.4972 9.78461 16.9745 10.025 17.3964L12.734 22.0311C12.9777 22.4533 13.3275 22.8044 13.7487 23.0498C14.1699 23.2951 14.6479 23.4262 15.1353 23.4299H20.516C21.0034 23.4262 21.4814 23.2951 21.9026 23.0498C22.3238 22.8044 22.6736 22.4533 22.9173 22.0311L25.6077 17.3684C25.848 16.9465 25.9744 16.4692 25.9744 15.9836C25.9744 15.498 25.848 15.0208 25.6077 14.5988L22.9173 9.93614C22.6685 9.51647 22.3143 9.16917 21.8898 8.9287C21.4652 8.68823 20.9852 8.56296 20.4974 8.56531Z"
        fill="url(#paint6_linear_255_3177)"
      />
      <path
        d="M20.1943 9.35803H15.4011C14.9667 9.35815 14.5399 9.47235 14.1635 9.68919C13.7871 9.90603 13.4743 10.2179 13.2562 10.5936L10.8689 14.7574C10.6512 15.1345 10.5366 15.5623 10.5366 15.9977C10.5366 16.4331 10.6512 16.8609 10.8689 17.238L13.2702 21.4017C13.4882 21.7775 13.8011 22.0893 14.1775 22.3062C14.5539 22.523 14.9807 22.6372 15.4151 22.6373H20.1943C20.6287 22.6372 21.0554 22.523 21.4319 22.3062C21.8083 22.0893 22.1211 21.7775 22.3391 21.4017L24.7404 17.238C24.9581 16.8609 25.0727 16.4331 25.0727 15.9977C25.0727 15.5623 24.9581 15.1345 24.7404 14.7574L22.3391 10.5936C22.1211 10.2179 21.8083 9.90603 21.4319 9.68919C21.0554 9.47235 20.6287 9.35815 20.1943 9.35803Z"
        fill="url(#paint7_linear_255_3177)"
      />
      <path
        style={{ mixBlendMode: "screen" }}
        d="M27.5565 4.39694C27.1392 3.52565 26.4887 2.78694 25.6772 2.26269C24.8657 1.73843 23.9249 1.44912 22.9591 1.42682H12.6499C11.6875 1.45357 10.7511 1.74489 9.94342 2.26883C9.13572 2.79277 8.48794 3.52907 8.07118 4.39694L2.90027 14.3844C2.26627 15.6392 2.05214 17.0645 2.28946 18.4503C7.64091 19.6183 13.1034 20.2014 18.5808 20.1894C23.5049 20.19 28.4174 19.7137 33.2496 18.7673C33.5856 17.2809 33.391 15.7237 32.6994 14.3657L27.5565 4.39694Z"
        fill="url(#paint8_linear_255_3177)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_255_3177"
          x1="1.47261e-06"
          y1="8.28557"
          x2="17.8068"
          y2="8.28557"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#61B8BA" />
          <stop offset="1" stopColor="#81DBE2" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_255_3177"
          x1="17.8071"
          y1="8.28557"
          x2="35.6139"
          y2="8.28557"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#61B8BA" />
          <stop offset="1" stopColor="#81DBE2" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_255_3177"
          x1="8.90137"
          y1="7.99652"
          x2="26.7128"
          y2="7.99652"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B9E6EA" />
          <stop offset="1" stopColor="#81DBE2" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_255_3177"
          x1="17.8066"
          y1="23.7098"
          x2="35.6134"
          y2="23.7098"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#61B8BA" />
          <stop offset="1" stopColor="#298F91" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_255_3177"
          x1="8.90137"
          y1="23.9988"
          x2="26.7128"
          y2="23.9988"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#61B8BA" />
          <stop offset="1" stopColor="#81DBE2" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_255_3177"
          x1="1.47261e-06"
          y1="23.7097"
          x2="17.8068"
          y2="23.7097"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#61B8BA" />
          <stop offset="1" stopColor="#298F91" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_255_3177"
          x1="9.65197"
          y1="15.9976"
          x2="25.962"
          y2="15.9976"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#61B8BA" />
          <stop offset="1" stopColor="#298F91" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_255_3177"
          x1="10.5239"
          y1="15.9977"
          x2="25.0948"
          y2="15.9977"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B9E6EA" />
          <stop offset="1" stopColor="#81DBE2" />
        </linearGradient>
        <linearGradient
          id="paint8_linear_255_3177"
          x1="17.8068"
          y1="11.2464"
          x2="17.8068"
          y2="-68.8957"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#272525" />
          <stop offset="1" stopColor="#3FFFF6" />
        </linearGradient>
      </defs>
    </svg>
  );
};
