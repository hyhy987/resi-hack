import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { nusId, password } = parsed.data;
  const normalizedNusId = nusId.toUpperCase();

  const user = await db.user.findUnique({
    where: { nusId: normalizedNusId },
    select: {
      id: true,
      name: true,
      nusId: true,
      diningHall: true,
      breakfastCredits: true,
      dinnerCredits: true,
      contactHandle: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid NUSNET ID or password" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid NUSNET ID or password" },
      { status: 401 }
    );
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  const response = NextResponse.json({ user: userWithoutPassword });
  setAuthCookie(response, user.id);
  return response;
}
