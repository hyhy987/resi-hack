import { z } from "zod";
import { MAX_CREDITS, MAX_SWAP_AMOUNT, DINING_HALLS } from "./constants";

const nusIdSchema = z
  .string()
  .regex(/^E\d{7}$/i, "Invalid format. Use E followed by 7 digits (e.g. E1234567)");

export const loginSchema = z.object({
  nusId: nusIdSchema,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  nusId: nusIdSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1).max(100),
  diningHall: z.enum(DINING_HALLS),
  contactHandle: z.string().max(100).optional().default(""),
});

export const createListingSchema = z.object({
  type: z.enum(["OFFER", "REQUEST"]),
  creditType: z.enum(["BREAKFAST", "DINNER"]),
  amount: z.number().int().min(1).max(MAX_SWAP_AMOUNT),
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
  nusId: nusIdSchema,
  breakfastCredits: z.number().int().min(0).max(MAX_CREDITS).optional(),
  dinnerCredits: z.number().int().min(0).max(MAX_CREDITS).optional(),
});
