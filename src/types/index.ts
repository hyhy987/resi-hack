export type ListingType = "OFFER" | "REQUEST";
export type ListingStatus = "ACTIVE" | "MATCHED" | "EXPIRED" | "CANCELLED";
export type SwapStatus =
  | "PROPOSED"
  | "ACCEPTED"
  | "CONFIRMED_BY_GIVER"
  | "CONFIRMED_BY_RECEIVER"
  | "COMPLETED"
  | "CANCELLED";

export interface UserData {
  id: string;
  name: string;
  nusId?: string;
  diningHall: string;
  breakfastCredits: number;
  dinnerCredits: number;
  contactHandle: string;
}

export interface ListingData {
  id: string;
  userId: string;
  type: ListingType;
  creditType: "BREAKFAST" | "DINNER";
  amount: number;
  notes: string;
  status: ListingStatus;
  expiresAt: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    breakfastCredits: number;
    dinnerCredits: number;
  };
}

export interface SwapData {
  id: string;
  listingId: string;
  proposerId: string;
  counterpartyId: string;
  amount: number;
  status: SwapStatus;
  giverConfirmed: boolean;
  receiverConfirmed: boolean;
  createdAt: string;
  listing: {
    id: string;
    type: ListingType;
    creditType: "BREAKFAST" | "DINNER";
    amount: number;
    notes: string;
  };
  proposer: {
    id: string;
    name: string;
    nusId?: string;
    contactHandle?: string;
  };
  counterparty: {
    id: string;
    name: string;
    nusId?: string;
    contactHandle?: string;
  };
  messages: SwapMessageData[];
}

export interface SwapMessageData {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  user: { id: string; name: string };
}
