import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "./db";

export const COOKIE_NAME = "creditswap-user-id";

export function setAuthCookie(response: NextResponse, userId: string) {
  response.cookies.set(COOKIE_NAME, userId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(COOKIE_NAME)?.value;

  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      nusId: true,
      diningHall: true,
      breakfastCredits: true,
      dinnerCredits: true,
      contactHandle: true,
    },
  });

  return user;
}

export async function getCurrentUserOrThrow() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}
