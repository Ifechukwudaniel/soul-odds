import type { IconType } from "react-icons";
import { FaHourglassHalf, FaRegQuestionCircle, FaVenusMars } from "react-icons/fa";
import { GiFeather, GiTombstone } from "react-icons/gi";

const MARKET_ICONS: Record<string, IconType> = {
  sex: FaVenusMars,
  age: FaHourglassHalf,
  sins: GiFeather,
  dy: GiTombstone,
};

/** The icon for a market/bet id, shared between the market picker and the bet summary table. */
export function getMarketIcon(marketId: string): IconType {
  return MARKET_ICONS[marketId] ?? FaRegQuestionCircle;
}
