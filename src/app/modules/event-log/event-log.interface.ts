export type TSingleEventPayload = {
  eventName: string;
  timestamp: string; // ISO 8601 with offset, e.g. "2026-07-09T07:02:14-04:00"
  utcOffset?: string;
  sessionId: string;
  charLength?: number;
};

export type TCreateEventLogPayload = {
  events: TSingleEventPayload[];
};
