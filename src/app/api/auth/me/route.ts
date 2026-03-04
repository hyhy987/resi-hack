import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  const allUsers = await db.user.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ currentUser: user, allUsers });
}
