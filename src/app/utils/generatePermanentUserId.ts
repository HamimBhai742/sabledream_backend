import crypto from "crypto";
import { prisma } from "../lib/prisma";

/**
 * Generates a unique, non-recycled permanent user ID (e.g. USR-A1B2C3).
 * Checks both existing User records and DeletedUserId tombstone table.
 */
export const generatePermanentUserId = async (): Promise<string> => {
  let isUnique = false;
  let permanentId = "";

  while (!isUnique) {
    const randomBytes = crypto.randomBytes(3).toString("hex").toUpperCase();
    permanentId = `USR-${randomBytes}`;

    const existingUser = await prisma.user.findFirst({
      where: { permanentId },
    });

    const deletedUser = await prisma.deletedUserId.findFirst({
      where: { permanentId },
    });

    if (!existingUser && !deletedUser) {
      isUnique = true;
    }
  }

  return permanentId;
};

/**
 * Ensures a user object has a permanentId. If missing (for legacy users), generates and saves one.
 */
export const ensurePermanentUserId = async (userId: string, currentPermanentId?: string | null): Promise<string> => {
  if (currentPermanentId) {
    return currentPermanentId;
  }

  const newPermanentId = await generatePermanentUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { permanentId: newPermanentId },
  });

  return newPermanentId;
};
