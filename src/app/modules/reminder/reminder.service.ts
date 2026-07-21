import { prisma } from "../../lib/prisma";
import AppError from "../../error/AppError";
import httpStatus from "http-status";

type ReminderFrequency = "daily" | "weekly" | "monthly" | "off";

const allowedTypes = ["journal", "mood", "affirmation"];
const allowedDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const defaultTimeZone = "America/New_York";

const isValidTimeZone = (timeZone: string) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
};

const getReminderSettings = async (userId: string) => {
  const reminderTypes = allowedTypes;

  const existingReminders = await prisma.reminder.findMany({
    where: { userId },
  });

  const existingTypes = existingReminders.map((r) => r.type);
  const missingTypes = reminderTypes.filter((type) => !existingTypes.includes(type));

  if (missingTypes.length > 0) {
    const initData = missingTypes.map((type) => ({
      userId,
      type,
      enabled: true,
      dailyEnabled: false,
      weeklyEnabled: false,
      monthlyEnabled: false,
      monthlyLastDayEnabled: false,
      daysOfMonth: [],
      daysOfWeek: [],
      time: "08:00",
      timeZone: defaultTimeZone,
    }));

    await prisma.reminder.createMany({
      data: initData,
    });

    // Refetch to return complete set of 3 reminder settings
    return prisma.reminder.findMany({
      where: { userId },
    });
  }

  return existingReminders;
};

const updateReminderSettings = async (
  userId: string,
  type: string,
  data: {
    enabled?: boolean;
    dailyEnabled?: boolean;
    weeklyEnabled?: boolean;
    monthlyEnabled?: boolean;
    monthlyLastDayEnabled?: boolean;
    daysOfMonth?: number[];
    daysOfWeek?: string[];
    time?: string;
    timeZone?: string;
    frequency?: ReminderFrequency;
  }
) => {
  if (!allowedTypes.includes(type)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid reminder type. Allowed types: ${allowedTypes.join(", ")}`
    );
  }

  // Validate daysOfMonth are within 1-31 range
  if (data.daysOfMonth) {
    for (const day of data.daysOfMonth) {
      if (day < 1 || day > 31) {
        throw new AppError(httpStatus.BAD_REQUEST, "Days of month must be between 1 and 31");
      }
    }
  }

  // Normalize daysOfWeek to uppercase and validate
  if (data.daysOfWeek) {
    data.daysOfWeek = data.daysOfWeek.map((day) => day.toUpperCase());
    for (const day of data.daysOfWeek) {
      if (!allowedDays.includes(day)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Invalid day of week: ${day}. Allowed days: ${allowedDays.join(", ")}`
        );
      }
    }
  }

  // Validate time format (24-hour HH:mm)
  if (data.time !== undefined) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(data.time)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Time must be in 24-hour HH:mm format (e.g., 08:00)"
      );
    }
  }

  if (data.timeZone !== undefined && !isValidTimeZone(data.timeZone)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid timeZone. Use an IANA timezone value, e.g. America/New_York"
    );
  }

  if (data.frequency !== undefined && !["daily", "weekly", "monthly", "off"].includes(data.frequency)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid frequency. Allowed values: daily, weekly, monthly, off"
    );
  }

  const frequencyUpdate =
    data.frequency === undefined
      ? {}
      : {
          dailyEnabled: data.frequency === "daily",
          weeklyEnabled: data.frequency === "weekly",
          monthlyEnabled: data.frequency === "monthly",
        };

  const reminder = await prisma.reminder.upsert({
    where: {
      userId_type: {
        userId,
        type,
      },
    },
    update: {
      enabled: data.enabled,
      dailyEnabled: data.dailyEnabled,
      weeklyEnabled: data.weeklyEnabled,
      monthlyEnabled: data.monthlyEnabled,
      ...frequencyUpdate,
      monthlyLastDayEnabled: data.monthlyLastDayEnabled,
      daysOfMonth: data.daysOfMonth,
      daysOfWeek: data.daysOfWeek,
      time: data.time,
      timeZone: data.timeZone,
    },
    create: {
      userId,
      type,
      enabled: data.enabled ?? true,
      dailyEnabled: frequencyUpdate.dailyEnabled ?? data.dailyEnabled ?? false,
      weeklyEnabled: frequencyUpdate.weeklyEnabled ?? data.weeklyEnabled ?? false,
      monthlyEnabled: frequencyUpdate.monthlyEnabled ?? data.monthlyEnabled ?? false,
      monthlyLastDayEnabled: data.monthlyLastDayEnabled ?? false,
      daysOfMonth: data.daysOfMonth ?? [],
      daysOfWeek: data.daysOfWeek ?? [],
      time: data.time ?? "08:00",
      timeZone: data.timeZone ?? defaultTimeZone,
    },
  });

  return reminder;
};

export const ReminderService = {
  getReminderSettings,
  updateReminderSettings,
};
