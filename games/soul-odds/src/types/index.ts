export type LinkTask = {
  title: string;
  completed: boolean;
  reward: number;
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
  reward:number;
  completed:boolean
}

// =====================================
// ⬢  Mortal Odds
// =====================================
export type RegionId = "ssa" | "mena" | "eur" | "sas" | "eas" | "sea" | "ame";
export type EraFilter = "all" | "ce" | "modern";

export type Place = { name: string; continent: string; share: number; lat: number; lon: number };
export type Draw = { year: number; region: RegionId; place: Place };
export type PlaceContext = { where: string; local: string; when: string };

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

export type Life = {
  year: number;
  region: RegionId;
  sex: Sex;
  age: number;
  deathYear: number;
  shock: Shock | null;
  literate: boolean;
  city: boolean;
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