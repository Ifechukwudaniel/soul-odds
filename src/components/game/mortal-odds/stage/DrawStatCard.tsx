import { FaGlobe, FaRegCalendarAlt } from "react-icons/fa";

export const DrawStatCard = (props: { yearLabel: string; regionLabel: string }) => (
  <div className="stat-card grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-8 py-4">
    <div className="flex items-center gap-3 justify-self-start">
      <FaRegCalendarAlt size={26} className="text-[#5EEAD4]" />
      <div className="flex flex-col text-left">
        <p className="font-bold text-2xl text-white leading-tight">{props.yearLabel}</p>
        <p className="text-[#9C9FC7] text-xs leading-tight">Birth year</p>
      </div>
    </div>

    <div className="h-10 w-px bg-white/15" />

    <div className="flex items-center gap-3 justify-self-start">
      <FaGlobe size={26} className="text-[#5EEAD4]" />
      <div className="flex flex-col text-left">
        <p className="font-bold text-2xl text-white leading-tight">{props.regionLabel}</p>
        <p className="text-[#9C9FC7] text-xs leading-tight">Region</p>
      </div>
    </div>
  </div>
);
