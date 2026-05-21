import { prisma } from "../../lib/prisma";
import AppError from "../../error/AppError";
import httpStatus from "http-status";

const getReminderSettings = async (userId: string) => {
  const reminderTypes = ["journal", "mood", "affirmation"];

  const existingReminders = await prisma.reminder.findMany({
    where: { userId },
  });

  const existingTypes = existingReminders.map((r) => r.type);
  const missingTypes = reminderTypes.filter((type) => !existingTypes.includes(type));

  if (missingTypes.length > 0) {
    const initData = missingTypes.map((type) => ({
      userId,
      type,
      dailyEnabled: false,
      weeklyEnabled: false,
      monthlyEnabled: false,
      daysOfMonth: [],
      daysOfWeek: [],
      time: "08:00",
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
    dailyEnabled?: boolean;
    weeklyEnabled?: boolean;
    monthlyEnabled?: boolean;
    daysOfMonth?: number[];
    daysOfWeek?: string[];
    time?: string;
  }
) => {
  const allowedTypes = ["journal", "mood", "affirmation"];
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
    const allowedDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
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

  const reminder = await prisma.reminder.upsert({
    where: {
      userId_type: {
        userId,
        type,
      },
    },
    update: {
      dailyEnabled: data.dailyEnabled,
      weeklyEnabled: data.weeklyEnabled,
      monthlyEnabled: data.monthlyEnabled,
      daysOfMonth: data.daysOfMonth,
      daysOfWeek: data.daysOfWeek,
      time: data.time,
    },
    create: {
      userId,
      type,
      dailyEnabled: data.dailyEnabled ?? false,
      weeklyEnabled: data.weeklyEnabled ?? false,
      monthlyEnabled: data.monthlyEnabled ?? false,
      daysOfMonth: data.daysOfMonth ?? [],
      daysOfWeek: data.daysOfWeek ?? [],
      time: data.time ?? "08:00",
    },
  });

  return reminder;
};

export const ReminderService = {
  getReminderSettings,
  updateReminderSettings,
};
