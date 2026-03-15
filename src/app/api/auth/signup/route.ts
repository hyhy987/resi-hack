import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";
import { signupSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { nusId, password, name, diningHall, contactHandle } = parsed.data;
    const normalizedNusId = nusId.toUpperCase();

    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    try {
      user = await db.user.create({
        data: {
          name,
          nusId: normalizedNusId,
          passwordHash,
          diningHall,
          contactHandle: contactHandle ?? "",
        },
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
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        return NextResponse.json(
          { error: "An account with this NUSNET ID already exists" },
          { status: 409 }
        );
      }
      throw err;
    }

    const response = NextResponse.json({ user });
    setAuthCookie(response, user.id);
    return response;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Sign up failed" },
      { status: 500 }
    );
  }
}
