import { prisma } from "../../lib/prisma";
import { ensurePermanentUserId } from "../../utils/generatePermanentUserId";
import { TCreateEventLogPayload } from "./event-log.interface";
import AppError from "../../error/AppError";
import httpStatus from "http-status";

const createEventLogs = async (userId: string, payload: TCreateEventLogPayload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, permanentId: true },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const permanentUserId = await ensurePermanentUserId(user.id, user.permanentId);

  const eventLogRecords = payload.events.map((event) => {
    const parsedDate = new Date(event.timestamp);

    let offset = event.utcOffset;
    if (!offset) {
      const match = event.timestamp.match(/([+-]\d{2}:\d{2}|Z)$/);
      if (match) {
        offset = match[1];
      }
    }

    return {
      userId,
      permanentUserId,
      eventName: event.eventName,
      timestamp: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
      localTimestamp: event.timestamp,
      utcOffset: offset || "UTC",
      sessionId: event.sessionId,
      charLength: event.charLength ?? null,
    };
  });

  await prisma.eventLog.createMany({
    data: eventLogRecords,
  });

  return {
    count: eventLogRecords.length,
  };
};

export const EventLogService = {
  createEventLogs,
};
