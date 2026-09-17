import type { IconProps } from "@/types/icontypes";

export const GlobeIcon = (props: IconProps) => (
  <svg
    style={{ width: props.width, height: props.height }}
    className={props.className}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 3C11.933 3 13.5 6.13401 13.5 10C13.5 13.866 11.933 17 10 17C8.067 17 6.5 13.866 6.5 10C6.5 6.13401 8.067 3 10 3Z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
