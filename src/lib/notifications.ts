import { db } from "@/lib/db";

export async function createNotification({
  userId,
  type,
  title,
  message,
  linkUrl = "",
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
}) {
  return db.notification.create({
    data: { userId, type, title, message, linkUrl },
  });
}
