import { GiCycle, GiEarthAfricaEurope, GiHourglass, GiOpenBook, GiScales } from "react-icons/gi";
import type { InfoPoint } from "@/components/game/InfoDialog";
import { REDRAW_COST } from "@/lib/mortal-odds/config";

type SlideInfo = { title: string; intro: string; points: InfoPoint[] };

/**
 * What the "In which age?" step really does today: the odds are priced from the age alone
 * (the bookie's model has no region, sex or catastrophes), so keep these claims to that.
 */
export const AGE_INFO: SlideInfo = {
  title: "Why the age matters",
  intro: "Every soul is drawn from real history, and the age it lived in decides how the scales price your bets.",
  points: [
    {
      icon: GiHourglass,
      title: "Ages were not equally kind",
      text: "In the deep past many children never reached five and few grew old. In recent times most do.",
    },
    {
      icon: GiScales,
      title: "The odds follow the age",
      text: "Your picks are priced from this age's history, so the same guess pays more when it was rare then, and less when it was common.",
    },
    {
      icon: GiCycle,
      title: "Not the age you wanted?",
      text: `Redraw for ${REDRAW_COST} deben to summon a different soul. Your stake stays locked in.`,
    },
  ],
};

/**
 * What the "In which land?" step does today: the land shapes the life story shown at the reveal, not the odds.
 * The last point is a teaser for region-tilted sin odds and is marked "soon" until that ships; drop the flag then.
 */
export const LAND_INFO: SlideInfo = {
  title: "Why the land matters",
  intro: "Where a soul was born shapes the life it led.",
  points: [
    {
      icon: GiEarthAfricaEurope,
      title: "Places lived very differently",
      text: "Reading, city life and the hardships people met varied from land to land, and from age to age.",
    },
    {
      icon: GiOpenBook,
      title: "It writes the story you read",
      text: "Whether they could read, whether they lived in a city, and what finally took them all follow from where they lived.",
    },
    {
      icon: GiScales,
      title: "The land will tilt the scales",
      text: "Some lands and times made certain sins more common. Soon, where a soul lived will shift the odds on the sins you predict.",
      soon: true,
    },
  ],
};
