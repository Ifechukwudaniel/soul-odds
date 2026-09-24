import React from 'react';

type MenuLink = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  activeIcon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  innerRef?: (node: HTMLButtonElement | null) => void;
};

export const MenuBtn: React.FC<MenuLink> = ({
  label,
  icon,
  isActive,
  activeIcon,
  onClick,
  onKeyDown,
  innerRef,
}) => {
  return (
    <button
      ref={innerRef}
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="game-nav-btn font-inherit flex cursor-pointer flex-col items-center border-0 bg-transparent p-0 text-inherit"
    >
      <div className="nav-bubble relative">
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] transform">
          {isActive ? activeIcon : icon}
        </div>
        {/* ✦ Decorative background shape behind the real icon; the button's accessible name comes from the label below. ✦ */}
        <img
          src={`${isActive ? '/img/bubbleactive.png' : '/img/bubble.png'}`}
          alt=""
          width={64}
          height={64}
        />
      </div>

      <div
        className={` ${
          isActive ? 'purple-gradient menu-shadow text-white' : 'bg-[#262433] text-[#AFAFAF]'
        } " relative" z-10 mt-[-1rem] rounded-full border border-black px-[8px] py-[0.5px] text-[0.8rem] font-[500]`}
      >
        {label}
      </div>
    </button>
  );
};
