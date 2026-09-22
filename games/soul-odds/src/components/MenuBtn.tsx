import React from "react";

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

export const MenuBtn: React.FC<MenuLink> = ({ label, icon, isActive, activeIcon, onClick, onKeyDown, innerRef }) => {
  return (
    <button
      ref={innerRef}
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="game-nav-btn flex flex-col items-center cursor-pointer border-0 bg-transparent p-0 font-inherit text-inherit"
    >
      <div className="nav-bubble relative">
        <div className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%]">
          {isActive ? activeIcon : icon}
        </div>
        {/* Decorative background shape behind the real icon; the button's accessible name comes from the label below. */}
        <img src={`${isActive ? "/img/bubbleactive.png" : "/img/bubble.png"}`} alt="" width={64} height={64} />
      </div>

      <div
        className={`  ${
          isActive ? "text-white purple-gradient menu-shadow" : "text-[#AFAFAF] bg-[#262433]"
        }     " py-[0.5px] px-[8px] rounded-full mt-[-1rem] text-[0.8rem] border border-black font-[500] z-10 relative"`}
      >
        {label}
      </div>
    </button>
  );
};
