import React from "react";

export const OrcaBadge = ({ unlocked = false }: { unlocked: boolean }) => {
  return (
    <div>
      {unlocked ? (
        <svg width="95" height="116" viewBox="0 0 95 116" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_dd_672_653)">
            <path
              d="M23.1113 84.5767V56.7335H72.1405V84.3334C72.1405 84.593 72.0017 84.8327 71.7766 84.9619L47.6762 98.7922C47.452 98.9208 47.1763 98.9203 46.9526 98.7909L23.473 85.2038C23.2492 85.0743 23.1113 84.8353 23.1113 84.5767Z"
              fill="#84B7C4"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M37.3612 56.7335V93.2406L23.473 85.2038C23.2492 85.0743 23.1113 84.8353 23.1113 84.5767V56.7335H37.3612Z"
              fill="#6B9BAA"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M36.8789 92.9611V56.7335H37.362V93.2406L36.8789 92.9611Z"
              fill="#B0D2DD"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M57.8908 56.4919V92.999L71.779 84.9623C72.0028 84.8328 72.1406 84.5938 72.1406 84.3351V56.4919H57.8908Z"
              fill="#6B9BAA"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M58.373 92.7196V56.492H57.89V92.9991L58.373 92.7196Z"
              fill="#B0D2DD"
            />
            <g filter="url(#filter1_d_672_653)">
              <path
                d="M45.4577 15.1111L18.3031 29.8829C16.9276 30.6312 16.0713 32.0718 16.0713 33.6377L16.0713 67.4045C16.0713 68.9704 16.9275 70.4109 18.3031 71.1592L45.4577 85.931C46.7313 86.6238 48.2692 86.6238 49.5428 85.931L76.6974 71.1592C78.0729 70.4109 78.9292 68.9704 78.9292 67.4045L78.9292 33.6377C78.9292 32.0718 78.0729 30.6312 76.6974 29.8829L49.5428 15.1111C48.2692 14.4183 46.7313 14.4183 45.4577 15.1111Z"
                fill="url(#paint0_linear_672_653)"
              />
              <path
                d="M45.4279 20.6384L23.072 32.7998C21.7017 33.5452 20.8486 34.9804 20.8486 36.5404L20.8486 64.3748C20.8486 65.9348 21.7017 67.3699 23.072 68.1154L45.4279 80.2767C46.6966 80.9669 48.2288 80.9669 49.4976 80.2767L71.8534 68.1154C73.2238 67.3699 74.0768 65.9348 74.0768 64.3748L74.0768 36.5404C74.0768 34.9804 73.2238 33.5452 71.8534 32.7998L49.4976 20.6384C48.2288 19.9482 46.6966 19.9482 45.4279 20.6384Z"
                fill="url(#paint1_linear_672_653)"
              />
              <g filter="url(#filter2_f_672_653)">
                <path
                  d="M45.4279 20.6384L23.072 32.7998C21.7017 33.5452 20.8486 34.9804 20.8486 36.5404L20.8486 64.3748C20.8486 65.9348 21.7017 67.3699 23.072 68.1154L45.4279 80.2767C46.6966 80.9669 48.2288 80.9669 49.4976 80.2767L71.8534 68.1154C73.2238 67.3699 74.0768 65.9348 74.0768 64.3748L74.0768 36.5404C74.0768 34.9804 73.2238 33.5452 71.8534 32.7998L49.4976 20.6384C48.2288 19.9482 46.6966 19.9482 45.4279 20.6384Z"
                  stroke="url(#paint2_linear_672_653)"
                  strokeWidth="0.251432"
                />
              </g>
              <g opacity="0.5">
                <mask
                  id="mask0_672_653"
                  style={{ maskType: "alpha" }}
                  maskUnits="userSpaceOnUse"
                  x="23"
                  y="22"
                  width="50"
                  height="57"
                >
                  <path
                    d="M45.6917 23.0971L25.2276 34.2193C23.9234 34.9282 23.1113 36.2937 23.1113 37.7782L23.1113 63.2351C23.1113 64.7196 23.9233 66.0851 25.2276 66.794L45.6917 77.9162C46.8978 78.5718 48.354 78.5718 49.5602 77.9162L70.0242 66.794C71.3285 66.0851 72.1405 64.7196 72.1405 63.2351L72.1405 37.7782C72.1405 36.2937 71.3285 34.9282 70.0242 34.2193L49.5602 23.0971C48.354 22.4415 46.8978 22.4415 45.6917 23.0971Z"
                    fill="#A6D3DE"
                  />
                </mask>
                <g mask="url(#mask0_672_653)">
                  <path
                    d="M45.6917 23.0971L25.2276 34.2193C23.9234 34.9282 23.1113 36.2937 23.1113 37.7782L23.1113 63.2351C23.1113 64.7196 23.9233 66.0851 25.2276 66.794L45.6917 77.9162C46.8978 78.5718 48.354 78.5718 49.5602 77.9162L70.0242 66.794C71.3285 66.0851 72.1405 64.7196 72.1405 63.2351L72.1405 37.7782C72.1405 36.2937 71.3285 34.9282 70.0242 34.2193L49.5602 23.0971C48.354 22.4415 46.8978 22.4415 45.6917 23.0971Z"
                    fill="url(#paint3_radial_672_653)"
                  />
                  <g filter="url(#filter3_i_672_653)">
                    <path
                      d="M45.6917 23.0971L25.2276 34.2193C23.9234 34.9282 23.1113 36.2937 23.1113 37.7782L23.1113 63.2351C23.1113 64.7196 23.9233 66.0851 25.2276 66.794L45.6917 77.9162C46.8978 78.5718 48.354 78.5718 49.5602 77.9162L70.0242 66.794C71.3285 66.0851 72.1405 64.7196 72.1405 63.2351L72.1405 37.7782C72.1405 36.2937 71.3285 34.9282 70.0242 34.2193L49.5602 23.0971C48.354 22.4415 46.8978 22.4415 45.6917 23.0971Z"
                      fill="#AFF5F1"
                      fillOpacity="0.03"
                    />
                  </g>
                </g>
              </g>
            </g>
          </g>
          <defs>
            <filter
              id="filter0_dd_672_653"
              x="0.684565"
              y="0.230579"
              width="93.6318"
              height="115.07"
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
              <feGaussianBlur stdDeviation="2.56445" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.558594 0 0 0 0 0.869297 0 0 0 0 0.9375 0 0 0 0.04 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_672_653" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="1.02578" />
              <feGaussianBlur stdDeviation="7.69336" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.670833 0 0 0 0 1 0 0 0 0 0.94075 0 0 0 0.33 0" />
              <feBlend mode="normal" in2="effect1_dropShadow_672_653" result="effect2_dropShadow_672_653" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_672_653" result="shape" />
            </filter>
            <filter
              id="filter1_d_672_653"
              x="14.5627"
              y="14.5915"
              width="65.8756"
              height="75.3792"
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
              <feOffset dy="2.01145" />
              <feGaussianBlur stdDeviation="0.754295" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.208958 0 0 0 0 0.389892 0 0 0 0 0.491667 0 0 0 0.54 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_672_653" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_672_653" result="shape" />
            </filter>
            <filter
              id="filter2_f_672_653"
              x="20.6472"
              y="19.9196"
              width="53.6304"
              height="61.0759"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="0.0377148" result="effect1_foregroundBlur_672_653" />
            </filter>
            <filter
              id="filter3_i_672_653"
              x="23.1113"
              y="22.6054"
              width="49.0293"
              height="55.8025"
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
              <feGaussianBlur stdDeviation="1.69066" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.37849 0 0 0 0 0.586923 0 0 0 0 0.704167 0 0 0 1 0" />
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow_672_653" />
            </filter>
            <linearGradient
              id="paint0_linear_672_653"
              x1="34.3001"
              y1="22.8001"
              x2="62.5861"
              y2="78.9951"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#D8ECF1" />
              <stop offset="1" stopColor="#82B3BF" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_672_653"
              x1="34.0488"
              y1="27.4516"
              x2="58.4377"
              y2="72.4579"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#A1C9D3" />
              <stop offset="1" stopColor="#D0ECF2" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_672_653"
              x1="36.6888"
              y1="25.8173"
              x2="62.9634"
              y2="73.0864"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#D0ECF2" />
              <stop offset="1" stopColor="#E6F8FC" />
            </linearGradient>
            <radialGradient
              id="paint3_radial_672_653"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(47.6259 50.5066) rotate(90) scale(28.4608 24.5146)"
            >
              <stop stopColor="#D0EBF2" />
              <stop offset="1" stopColor="#8DD3E2" />
            </radialGradient>
          </defs>
        </svg>
      ) : (
        <svg width="63" height="83" viewBox="0 0 63 83" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7.11133 68.5651V40.7219H56.1405V68.3219C56.1405 68.5814 56.0017 68.8211 55.7766 68.9503L31.6762 82.7806C31.452 82.9093 31.1763 82.9088 30.9526 82.7793L7.47299 69.1923C7.24916 69.0627 7.11133 68.8237 7.11133 68.5651Z"
            fill="#040208"
            stroke="#EDEDED"
            stroke-width="0.241523"
          />
          <path
            d="M21.2404 40.8427V77.0196L7.53347 69.0877C7.34695 68.9798 7.23209 68.7806 7.23209 68.5651V40.8427H21.2404Z"
            fill="#040208"
            stroke="#EDEDED"
            stroke-width="0.241523"
          />
          <mask id="path-3-inside-1_2030_185" fill="white">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M20.8789 76.9498V40.7222H21.362V77.2293L20.8789 76.9498Z"
            />
          </mask>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M20.8789 76.9498V40.7222H21.362V77.2293L20.8789 76.9498Z"
            fill="#040208"
          />
          <path
            d="M20.8789 76.9498H20.6374V77.089L20.7579 77.1588L20.8789 76.9498ZM20.8789 40.7222V40.4806H20.6374V40.7222H20.8789ZM21.362 40.7222H21.6035V40.4806H21.362V40.7222ZM21.362 77.2293L21.241 77.4383L21.6035 77.6481V77.2293H21.362ZM21.1204 76.9498V40.7222H20.6374V76.9498H21.1204ZM20.8789 40.9637H21.362V40.4806H20.8789V40.9637ZM21.1204 40.7222V77.2293H21.6035V40.7222H21.1204ZM21.4829 77.0202L20.9999 76.7407L20.7579 77.1588L21.241 77.4383L21.4829 77.0202Z"
            fill="#EDEDED"
            mask="url(#path-3-inside-1_2030_185)"
          />
          <path
            d="M42.0115 40.6012V76.7781L55.7185 68.8463C55.905 68.7383 56.0199 68.5392 56.0199 68.3237V40.6012H42.0115Z"
            fill="#040208"
            stroke="#EDEDED"
            stroke-width="0.241523"
          />
          <mask id="path-6-inside-2_2030_185" fill="white">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M42.373 76.7081V40.4805H41.89V76.9876L42.373 76.7081Z" />
          </mask>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M42.373 76.7081V40.4805H41.89V76.9876L42.373 76.7081Z"
            fill="#040208"
          />
          <path
            d="M42.373 76.7081H42.6146V76.8473L42.494 76.9171L42.373 76.7081ZM42.373 40.4805V40.2389H42.6146V40.4805H42.373ZM41.89 40.4805H41.6485V40.2389H41.89V40.4805ZM41.89 76.9876L42.011 77.1966L41.6485 77.4064V76.9876H41.89ZM42.1315 76.7081V40.4805H42.6146V76.7081H42.1315ZM42.373 40.722H41.89V40.2389H42.373V40.722ZM42.1315 40.4805V76.9876H41.6485V40.4805H42.1315ZM41.769 76.7785L42.2521 76.499L42.494 76.9171L42.011 77.1966L41.769 76.7785Z"
            fill="#EDEDED"
            mask="url(#path-6-inside-2_2030_185)"
          />
          <path
            d="M2.42325 16.1038L29.5779 1.33198C30.7765 0.67993 32.224 0.67993 33.4226 1.33198L60.5772 16.1038C61.8719 16.8081 62.6778 18.1639 62.6778 19.6377L62.6778 53.4045C62.6778 54.8783 61.8719 56.2341 60.5772 56.9383L33.4226 71.7102C32.224 72.3622 30.7765 72.3622 29.5779 71.7102L2.42324 56.9383C1.12861 56.2341 0.322721 54.8783 0.322721 53.4045L0.322729 19.6377C0.322729 18.1639 1.12862 16.8081 2.42325 16.1038Z"
            fill="#040208"
            stroke="#EDEDED"
            stroke-width="0.502863"
          />
          <g opacity="0.5">
            <mask
              id="mask0_2030_185"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="7"
              y="8"
              width="50"
              height="57"
            >
              <path
                d="M9.34769 20.4403L29.8117 9.31807C30.943 8.70321 32.3088 8.70321 33.4401 9.31807L53.9041 20.4403C55.1275 21.1052 55.8891 22.3859 55.8891 23.7782L55.8891 49.2352C55.8891 50.6275 55.1274 51.9083 53.9041 52.5732L33.4401 63.6954C32.3088 64.3103 30.943 64.3103 29.8117 63.6954L9.34768 52.5732C8.12437 51.9083 7.36276 50.6275 7.36276 49.2352L7.36277 23.7782C7.36277 22.3859 8.12438 21.1052 9.34769 20.4403Z"
                fill="#A6D3DE"
                stroke="#EDEDED"
                stroke-width="0.502863"
              />
            </mask>
            <g mask="url(#mask0_2030_185)">
              <path
                d="M9.34769 20.4403L29.8117 9.31807C30.943 8.70321 32.3088 8.70321 33.4401 9.31807L53.9041 20.4403C55.1275 21.1052 55.8891 22.3859 55.8891 23.7782L55.8891 49.2352C55.8891 50.6275 55.1274 51.9083 53.9041 52.5732L33.4401 63.6954C32.3088 64.3103 30.943 64.3103 29.8117 63.6954L9.34768 52.5732C8.12437 51.9083 7.36276 50.6275 7.36276 49.2352L7.36277 23.7782C7.36277 22.3859 8.12438 21.1052 9.34769 20.4403Z"
                fill="#040208"
                stroke="#EDEDED"
                stroke-width="0.502863"
              />
              <g filter="url(#filter0_i_2030_185)">
                <path
                  d="M29.6917 9.09716L9.22762 20.2194C7.92335 20.9283 7.11133 22.2938 7.11133 23.7782L7.11133 49.2352C7.11133 50.7197 7.92335 52.0852 9.22762 52.7941L29.6917 63.9163C30.8978 64.5719 32.354 64.5719 33.5602 63.9163L54.0242 52.7941C55.3285 52.0852 56.1405 50.7197 56.1405 49.2352L56.1405 23.7782C56.1405 22.2938 55.3285 20.9283 54.0242 20.2194L33.5602 9.09716C32.354 8.4416 30.8978 8.4416 29.6917 9.09716Z"
                  fill="#040208"
                />
              </g>
              <path
                d="M9.34769 20.4403L29.8117 9.31807C30.943 8.70321 32.3088 8.70321 33.4401 9.31807L53.9041 20.4403C55.1275 21.1052 55.8891 22.3859 55.8891 23.7782L55.8891 49.2352C55.8891 50.6275 55.1274 51.9083 53.9041 52.5732L33.4401 63.6954C32.3088 64.3103 30.943 64.3103 29.8117 63.6954L9.34768 52.5732C8.12437 51.9083 7.36276 50.6275 7.36276 49.2352L7.36277 23.7782C7.36277 22.3859 8.12438 21.1052 9.34769 20.4403Z"
                stroke="#EDEDED"
                stroke-width="0.502863"
              />
            </g>
          </g>
          <defs>
            <filter
              id="filter0_i_2030_185"
              x="7.11133"
              y="8.60547"
              width="49.0293"
              height="55.8025"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="1.69066" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.37849 0 0 0 0 0.586923 0 0 0 0 0.704167 0 0 0 1 0" />
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow_2030_185" />
            </filter>
          </defs>
        </svg>
      )}
    </div>
  );
};
