import { z } from "zod";
import { MAX_CREDITS, DINING_HALLS } from "./constants";

export const createListingSchema = z.object({
  type: z.enum(["OFFER", "REQUEST"]),
  amount: z.number().int().min(1).max(MAX_CREDITS),
  notes: z.string().max(500).optional().default(""),
});

export const createSwapSchema = z.object({
  listingId: z.string().min(1),
  amount: z.number().int().min(1).max(MAX_CREDITS),
});

export const sendMessageSchema = z.object({
  message: z.string().min(1).max(1000),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  contactHandle: z.string().max(100).optional(),
  diningHall: z.enum(DINING_HALLS),
  trackedCredits: z.number().int().min(0).max(MAX_CREDITS).optional(),
});
