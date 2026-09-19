import Image from "next/image";
import type { IconProps } from "@/types/icontypes";
import skull from "@/public/img/Skull.png";

const DEFAULT_SIZE = 32;

function toSize(value: string | number | undefined): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SIZE;
}

export const Skull = (props: IconProps) => {
  const size = toSize(props.width ?? props.height);
  return <Image src={skull} alt="Skull" width={size} height={size} className={props.className} priority />;
};
