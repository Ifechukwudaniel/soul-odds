import React from "react";

type MenuLink = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  activeIcon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
};

export const MenuBtn: React.FC<MenuLink> = ({ label, icon, isActive, activeIcon, onClick }) => {
  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
      <div className="relative">
        <div className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%]">
          {isActive ? activeIcon : icon}
        </div>
        <img src={`${isActive ? "/img/bubbleactive.png" : "/img/bubble.png"}`} alt="Bubble" width={64} height={64} />
      </div>

      <div
        className={`  ${
          isActive ? "text-white purple-gradient menu-shadow" : "text-[#AFAFAF] bg-[#262433]"
        }     " py-[0.5px] px-[8px] rounded-full mt-[-1rem] text-[0.8rem] border border-black font-[500] z-10 relative"`}
      >
        {label}
      </div>
    </div>
  );
};
