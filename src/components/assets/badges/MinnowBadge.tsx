import React from "react";

export const MinnowBadge = ({ unlocked = false }: { unlocked: boolean }) => {
  return (
    <div>
      {unlocked ? (
        <svg width="91" height="103" viewBox="0 0 91 103" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_d_672_9649)">
            <g filter="url(#filter1_d_672_9649)">
              <path
                d="M43.1231 10.293L11.523 27.4832C9.92223 28.3539 8.92579 30.0303 8.92579 31.8526L8.92578 71.1474C8.92578 72.9697 9.92222 74.646 11.523 75.5168L43.1231 92.707C44.6052 93.5132 46.3949 93.5132 47.8769 92.707L79.4771 75.5168C81.0778 74.646 82.0742 72.9697 82.0742 71.1474L82.0743 31.8526C82.0743 30.0303 81.0778 28.3539 79.4771 27.4832L47.8769 10.293C46.3949 9.48679 44.6052 9.48679 43.1231 10.293Z"
                fill="url(#paint0_linear_672_9649)"
              />
              <path
                d="M43.0885 16.7252L17.0728 30.8775C15.478 31.745 14.4854 33.4151 14.4854 35.2305L14.4854 67.6218C14.4854 69.4372 15.478 71.1072 17.0728 71.9747L43.0885 86.127C44.565 86.9302 46.348 86.9302 47.8244 86.127L73.8402 71.9747C75.4349 71.1072 76.4276 69.4371 76.4276 67.6217L76.4276 35.2305C76.4276 33.4151 75.4349 31.745 73.8402 30.8775L47.8244 16.7252C46.348 15.922 44.565 15.922 43.0885 16.7252Z"
                fill="url(#paint1_linear_672_9649)"
              />
              <g filter="url(#filter2_f_672_9649)">
                <path
                  d="M43.0885 16.7252L17.0728 30.8775C15.478 31.745 14.4854 33.4151 14.4854 35.2305L14.4854 67.6218C14.4854 69.4372 15.478 71.1072 17.0728 71.9747L43.0885 86.127C44.565 86.9302 46.348 86.9302 47.8244 86.127L73.8402 71.9747C75.4349 71.1072 76.4276 69.4371 76.4276 67.6217L76.4276 35.2305C76.4276 33.4151 75.4349 31.745 73.8402 30.8775L47.8244 16.7252C46.348 15.922 44.565 15.922 43.0885 16.7252Z"
                  stroke="url(#paint2_linear_672_9649)"
                  strokeWidth="0.292594"
                />
              </g>
              <g opacity="0.5">
                <mask
                  id="mask0_672_9649"
                  style={{ maskType: "alpha" }}
                  maskUnits="userSpaceOnUse"
                  x="17"
                  y="19"
                  width="58"
                  height="65"
                >
                  <path
                    d="M43.3961 19.5864L19.5819 32.5294C18.0641 33.3544 17.1191 34.9434 17.1191 36.6709L17.1191 66.2955C17.1191 68.023 18.0641 69.6121 19.5819 70.437L43.3961 83.38C44.7998 84.1429 46.4943 84.1429 47.8979 83.38L71.7122 70.437C73.23 69.6121 74.1749 68.023 74.1749 66.2955L74.175 36.6709C74.175 34.9434 73.23 33.3544 71.7122 32.5294L47.8979 19.5864C46.4943 18.8235 44.7998 18.8235 43.3961 19.5864Z"
                    fill="#A6D3DE"
                  />
                </mask>
                <g mask="url(#mask0_672_9649)">
                  <path
                    d="M43.3961 19.5864L19.5819 32.5294C18.0641 33.3544 17.1191 34.9434 17.1191 36.6709L17.1191 66.2955C17.1191 68.023 18.0641 69.6121 19.5819 70.437L43.3961 83.38C44.7998 84.1429 46.4943 84.1429 47.8979 83.38L71.7122 70.437C73.23 69.6121 74.1749 68.023 74.1749 66.2955L74.175 36.6709C74.175 34.9434 73.23 33.3544 71.7122 32.5294L47.8979 19.5864C46.4943 18.8235 44.7998 18.8235 43.3961 19.5864Z"
                    fill="url(#paint3_radial_672_9649)"
                  />
                  <g filter="url(#filter3_i_672_9649)">
                    <path
                      d="M43.3961 19.5864L19.5819 32.5294C18.0641 33.3544 17.1191 34.9434 17.1191 36.6709L17.1191 66.2955C17.1191 68.023 18.0641 69.6121 19.5819 70.437L43.3961 83.38C44.7998 84.1429 46.4943 84.1429 47.8979 83.38L71.7122 70.437C73.23 69.6121 74.1749 68.023 74.1749 66.2955L74.175 36.6709C74.175 34.9434 73.23 33.3544 71.7122 32.5294L47.8979 19.5864C46.4943 18.8235 44.7998 18.8235 43.3961 19.5864Z"
                      fill="#BCB0AE"
                      fillOpacity="0.03"
                    />
                  </g>
                </g>
              </g>
            </g>
          </g>
          <defs>
            <filter
              id="filter0_d_672_9649"
              x="0.147964"
              y="0.910537"
              width="90.7041"
              height="101.179"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="4.38891" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.92549 0 0 0 0 0.909804 0 0 0 0 0.913725 0 0 0 0.48 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_672_9649" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_672_9649" result="shape" />
            </filter>
            <filter
              id="filter1_d_672_9649"
              x="7.17022"
              y="9.68835"
              width="76.6596"
              height="87.7196"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="2.34075" />
              <feGaussianBlur stdDeviation="0.877782" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.475 0 0 0 0 0.425521 0 0 0 0 0.425521 0 0 0 0.35 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_672_9649" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_672_9649" result="shape" />
            </filter>
            <filter
              id="filter2_f_672_9649"
              x="14.2511"
              y="15.8888"
              width="62.4109"
              height="71.0747"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="0.0438891" result="effect1_foregroundBlur_672_9649" />
            </filter>
            <filter
              id="filter3_i_672_9649"
              x="17.1191"
              y="19.0142"
              width="57.0557"
              height="64.938"
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
              <feGaussianBlur stdDeviation="1.96744" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.508333 0 0 0 0 0.437506 0 0 0 0 0.415139 0 0 0 1 0" />
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow_672_9649" />
            </filter>
            <linearGradient
              id="paint0_linear_672_9649"
              x1="30.1388"
              y1="19.2408"
              x2="63.0557"
              y2="84.6355"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#EDE9EA" />
              <stop offset="1" stopColor="#BEB5B6" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_672_9649"
              x1="29.8465"
              y1="24.6538"
              x2="58.2281"
              y2="77.0281"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#C3BBBB" />
              <stop offset="1" stopColor="#ECE8E9" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_672_9649"
              x1="32.9188"
              y1="22.7519"
              x2="63.4948"
              y2="77.7596"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#C9C2C3" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <radialGradient
              id="paint3_radial_672_9649"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(45.647 51.4832) rotate(90) scale(33.1202 28.5279)"
            >
              <stop stopColor="#DFD6D5" />
              <stop offset="1" stopColor="#918888" />
            </radialGradient>
          </defs>
        </svg>
      ) : (
        <svg width="75" height="85" viewBox="0 0 75 85" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3.62783 18.6759L35.228 1.48579C36.6446 0.71513 38.3554 0.71513 39.7721 1.48579L71.3722 18.6759C72.9023 19.5083 73.8548 21.1107 73.8548 22.8526L73.8548 62.1474C73.8548 63.8893 72.9023 65.4917 71.3722 66.3241L39.7721 83.5142C38.3554 84.2849 36.6446 84.2849 35.228 83.5142L3.62782 66.3241C2.09771 65.4917 1.14523 63.8893 1.14523 62.1474L1.14524 22.8526C1.14524 21.1107 2.09772 19.5083 3.62783 18.6759Z"
            fill="#040208"
            stroke="#EDEDED"
            stroke-width="0.438891"
          />
          <path
            d="M35.0885 7.72517L9.07276 21.8774C7.47805 22.745 6.48536 24.415 6.48536 26.2304L6.48535 58.6217C6.48535 60.4371 7.47804 62.1072 9.07275 62.9747L35.0885 77.127C36.565 77.9302 38.348 77.9302 39.8244 77.127L65.8402 62.9747C67.4349 62.1072 68.4276 60.4371 68.4276 58.6217L68.4276 26.2304C68.4276 24.415 67.4349 22.745 65.8402 21.8775L39.8244 7.72517C38.348 6.92197 36.565 6.92197 35.0885 7.72517Z"
            fill="#040208"
          />
          <g filter="url(#filter0_f_742_9349)">
            <path
              d="M35.0885 7.72517L9.07276 21.8774C7.47805 22.745 6.48536 24.415 6.48536 26.2304L6.48535 58.6217C6.48535 60.4371 7.47804 62.1072 9.07275 62.9747L35.0885 77.127C36.565 77.9302 38.348 77.9302 39.8244 77.127L65.8402 62.9747C67.4349 62.1072 68.4276 60.4371 68.4276 58.6217L68.4276 26.2304C68.4276 24.415 67.4349 22.745 65.8402 21.8775L39.8244 7.72517C38.348 6.92197 36.565 6.92197 35.0885 7.72517Z"
              stroke="#040208"
              stroke-width="0.292594"
            />
          </g>
          <g opacity="0.5">
            <mask
              id="mask0_742_9349"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="9"
              y="10"
              width="58"
              height="65"
            >
              <path
                d="M35.3961 10.5864L11.5819 23.5295C10.0641 24.3544 9.11915 25.9435 9.11915 27.6709L9.11914 57.2955C9.11914 59.023 10.0641 60.6121 11.5819 61.437L35.3961 74.3801C36.7998 75.143 38.4943 75.143 39.8979 74.3801L63.7122 61.437C65.23 60.6121 66.1749 59.023 66.1749 57.2955L66.175 27.671C66.175 25.9435 65.23 24.3544 63.7122 23.5295L39.8979 10.5864C38.4943 9.82352 36.7998 9.82352 35.3961 10.5864Z"
                fill="#A6D3DE"
              />
            </mask>
            <g mask="url(#mask0_742_9349)">
              <path
                d="M35.3961 10.5864L11.5819 23.5295C10.0641 24.3544 9.11915 25.9435 9.11915 27.6709L9.11914 57.2955C9.11914 59.023 10.0641 60.6121 11.5819 61.437L35.3961 74.3801C36.7998 75.143 38.4943 75.143 39.8979 74.3801L63.7122 61.437C65.23 60.6121 66.1749 59.023 66.1749 57.2955L66.175 27.671C66.175 25.9435 65.23 24.3544 63.7122 23.5295L39.8979 10.5864C38.4943 9.82352 36.7998 9.82352 35.3961 10.5864Z"
                fill="#040208"
              />
              <path
                d="M11.6867 23.7223L35.5009 10.7792C36.8392 10.0518 38.4549 10.0518 39.7932 10.7792L63.6074 23.7223C65.0545 24.5088 65.9555 26.0239 65.9555 27.671L65.9555 57.2955C65.9555 58.9426 65.0545 60.4577 63.6074 61.2442L39.7932 74.1873C38.4549 74.9146 36.8392 74.9146 35.5009 74.1873L11.6867 61.2442C10.2396 60.4577 9.33859 58.9426 9.33859 57.2955L9.33859 27.6709C9.33859 26.0239 10.2396 24.5088 11.6867 23.7223Z"
                fill="#040208"
                stroke="#EDEDED"
                stroke-width="0.438891"
              />
            </g>
          </g>
          <defs>
            <filter
              id="filter0_f_742_9349"
              x="6.25109"
              y="6.88878"
              width="62.4109"
              height="71.0747"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="0.0438891" result="effect1_foregroundBlur_742_9349" />
            </filter>
          </defs>
        </svg>
      )}
    </div>
  );
};
