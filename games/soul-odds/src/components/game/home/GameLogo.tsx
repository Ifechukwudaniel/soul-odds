import Image from "next/image";
import lyphLogo from "@/public/img/lymp.png";

export const GameLogo = () => <Image src={lyphLogo} alt="LYPH" className="h-14 w-auto" priority />;
