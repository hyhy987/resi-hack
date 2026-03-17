import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendMessageSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const messages = await db.swapMessage.findMany({
    where: { swapId: id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const swap = await db.swap.findUnique({ where: { id } });
  if (!swap) {
    return NextResponse.json({ error: "Swap not found" }, { status: 404 });
  }

  if (swap.proposerId !== user.id && swap.counterpartyId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const message = await db.swapMessage.create({
    data: {
      swapId: id,
      userId: user.id,
      message: parsed.data.message,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  // Notify the other party about the new message
  const otherUserId =
    swap.proposerId === user.id ? swap.counterpartyId : swap.proposerId;

  await createNotification({
    userId: otherUserId,
    type: "NEW_MESSAGE",
    title: "New message",
    message: `${user.name}: ${parsed.data.message.substring(0, 80)}${parsed.data.message.length > 80 ? "..." : ""}`,
    linkUrl: `/swap/${id}`,
  });

  return NextResponse.json(message, { status: 201 });
}
