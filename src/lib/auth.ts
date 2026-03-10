import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE_NAME = "creditswap-user-id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(COOKIE_NAME)?.value;

  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      NUSID: true,
      diningHall: true,
      trackedCredits: true,
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
