import { z } from "zod";

const singleEventSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  timestamp: z.string().min(1, "Timestamp is required"),
  utcOffset: z.string().optional(),
  sessionId: z.string().min(1, "Session ID is required"),
  charLength: z.number().int().optional(),
});

const createEventLogSchema = z.object({
  events: z.array(singleEventSchema).min(1, "At least one event is required"),
});

export const EventLogValidation = {
  createEventLogSchema,
};
