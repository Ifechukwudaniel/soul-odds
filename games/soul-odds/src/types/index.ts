export type LinkTask = {
  title: string;
  completed: boolean;
  reward?: number;
  link: string;
};

export type QuestList = {
  title: string;
  desc: string;
  tasks: LinkTask[];
  id: string;
  claimed: boolean;
};


export type UserTask = {
  id:number,
  title: string;
  link: string;
  completed:boolean
}

// =====================================
// ⬢  Mortal Odds
// =====================================
export type RegionId = "ssa" | "mena" | "eur" | "sas" | "eas" | "sea" | "ame";
export type EraFilter = "all" | "ce" | "modern";

/**
 * `share` (this place's weighted fraction of its region's population) only applies to the
 * synthetic `places.json` model. `fromYear`/`toYear` (the date range a real polity is attested
 * for) only apply to a real historical place from the Cliopatria dataset. A place carries
 * exactly one of the two pairs, never both — see `lib/mortal-odds/place.ts`'s `toPlace`.
 * `population` is the estimated number of people the polity had in the drawn year, when an estimate exists.
 * `continent` is filled in for a polity, whose name doesn't carry one the way a synthetic place's ("City, Continent") does.
 */
export type Place = { name: string; lat: number; lon: number; share?: number; fromYear?: number; toYear?: number; population?: number; continent?: string };
export type Draw = { year: number; region: RegionId; place: Place };
export type PlaceContext = { where: string; local: string; when: string; story: string };

export type MarketOption = { id: string; label: string };
export type MarketConfig = {
  id: string;
  kind: "choice";
  title: string;
  note?: string;
  options: MarketOption[];
  fixedBookieP?: Record<string, number>;
};

export type ChanceTag = "Likely" | "Toss-up" | "Unlikely" | "Long shot";
export type Price = { p: number; odds: number | null; tag: ChanceTag };
export type MarketPrices = Record<string, Record<string, Price>>;

/** A step of the round the player has already paid for, shown as a line on the bet panel. "stake" is the locked round bet; "fee" is a side cost like a redraw. */
export type RoundCharge = { id: string; label: string; amount: number; kind: "stake" | "fee" };

export type Bet =
  | { marketId: string; kind: "choice"; optionId: string; stake: number }
  | { marketId: "dy"; kind: "range"; guessYear: number; stake: number };

export type Sex = "girl" | "boy";

export type Shock = {
  id: string;
  label: string;
  phrase: string;
  from: number;
  to: number;
  ages?: [number, number];
};

/** The one sin (of the sins.json catalog) this life is recorded as having committed, if any. */
export type Sin = { id: string; label: string; phrase: string; from: number; to: number | null };

export type Life = {
  year: number;
  region: RegionId;
  sex: Sex;
  age: number;
  deathYear: number;
  shock: Shock | null;
  literate: boolean;
  city: boolean;
  /** The first sin recorded, which drives the story and epitaph flavor. */
  sin: Sin | null;
  /** Every sin the chain recorded (the contract allows two). Absent on lives drawn by the local flavor model. */
  sins?: Sin[];
  /** A random cause of death fitting the soul's age and era; null while still living or when a shock killed them. Absent on lives drawn by the local flavor model. */
  cause?: string | null;
};

export type BetResult = {
  marketId: string;
  marketLabel: string;
  won: boolean;
  stake: number;
  net: number;
  skill: number;
  pickLabel: string;
  outcomeLabel: string;
  bookieP: number;
  realP: number;
  /** The payout multiplier that was locked in at bet time, for display on the reveal stamp. */
  odds: number;
};

export interface LeaderboardUser {
  id: string;
  rank: number;
  username: string;
  handle: string;
  followers: number;
  points: number;
  reward: number;
}
 

export interface PodiumUser extends LeaderboardUser {
  prize: number;
}

export type PodiumEntry = [PodiumUser, PodiumUser, PodiumUser];