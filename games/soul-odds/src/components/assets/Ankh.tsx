import Image from "next/image";
import ankh from "@/public/egypt/Relics/sand_relics_golden_ankh_01.png";

export const Ankh  = ({ active }: { active: boolean }) => {
  return (
    <Image
      src={ankh}
      alt="Ankh"
      width={32}
      height={32}
      className={active ? "opacity-100" : "opacity-40 grayscale"}
      priority
    />
  );
};