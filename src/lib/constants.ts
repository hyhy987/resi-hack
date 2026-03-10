export const MAX_CREDITS = 200;
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
