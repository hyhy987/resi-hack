export const MAX_SWAP_AMOUNT = 3;
export const MAX_CREDITS = 150;
export const CREDIT_TYPES = ["BREAKFAST", "DINNER"] as const;
export type CreditType = (typeof CREDIT_TYPES)[number];

export const MAX_DAILY_LISTINGS = 3;
export const EXPIRY_HOURS = 48;

export const DINING_HALLS = [
  "RVRC",
  "Acacia / Tembusu",
  "CAPT/RC4",
  "Elm",
  "Cendana",
  "Eusoff",
  "Kent Ridge",
  "King Edward VII",
  "Raffles",
  "Sheares",
  "Temasek",
] as const;

export type DiningHall = (typeof DINING_HALLS)[number];
