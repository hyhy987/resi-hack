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
  diningHall: string;
  trackedCredits: number;
  contactHandle: string;
}

export interface ListingData {
  id: string;
  userId: string;
  type: ListingType;
  amount: number;
  notes: string;
  status: ListingStatus;
  expiresAt: string;
  createdAt: string;
  user: { id: string; name: string };
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
  listing: { id: string; type: ListingType; amount: number; notes: string };
  proposer: { id: string; name: string };
  counterparty: { id: string; name: string };
  messages: SwapMessageData[];
}

export interface SwapMessageData {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  user: { id: string; name: string };
}
