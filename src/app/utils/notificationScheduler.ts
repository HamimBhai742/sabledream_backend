import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { sendPushNotification } from "./sendNotification";

const defaultTimeZone = "Asia/Dhaka";

type ReminderLocalParts = {
  time: string;
  dayOfMonth: number;
  dayOfWeek: string;
  isLastDayOfMonth: boolean;
};

const getReminderLocalParts = (date: Date, timeZone: string): ReminderLocalParts | null => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      weekday: "short",
    });

    const parts = formatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

    const year = Number(parts.year);
    const month = Number(parts.month);
    const dayOfMonth = Number(parts.day);
    const lastDayOfMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    return {
      time: `${parts.hour}:${parts.minute}`,
      dayOfMonth,
      dayOfWeek: parts.weekday.toUpperCase(),
      isLastDayOfMonth: dayOfMonth === lastDayOfMonth,
    };
  } catch (error) {
    console.error(`[SCHEDULER] Invalid reminder timezone "${timeZone}":`, error);
    return null;
  }
};

// Helper to fetch a dynamic affirmation from the database
const getRandomAffirmation = async (goal?: string) => {
  try {
    const whereClause: any = {};
    if (goal) {
      whereClause.goal = goal;
    }
    const count = await prisma.affirmation.count({ where: whereClause });
    if (count === 0) return null;

    const skip = Math.floor(Math.random() * count);
    const affirmations = await prisma.affirmation.findMany({
      where: whereClause,
      skip,
      take: 1,
    });
    return affirmations[0];
  } catch (error) {
    console.error("[SCHEDULER] Failed to fetch dynamic affirmation:", error);
    return null;
  }
};

export const startNotificationScheduler = () => {
  // Run every minute to check and trigger scheduled notifications.
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      console.log(`[SCHEDULER] Checking reminders at ${now.toISOString()}`);

      // Reminder time is compared in each user's timezone, not the server timezone.
      const reminders = await prisma.reminder.findMany({
        where: {
          enabled: true,
          user: {
            fcmToken: {
              not: null,
            },
          },
        },
        include: {
          user: true,
        },
      });

      for (const reminder of reminders) {
        if (!reminder.user.fcmToken) continue;

        const fcmToken = reminder.user.fcmToken;
        const localParts = getReminderLocalParts(now, reminder.timeZone || defaultTimeZone);
        if (!localParts || localParts.time !== reminder.time) continue;

        const monthlyDue =
          reminder.daysOfMonth.includes(localParts.dayOfMonth) ||
          (reminder.monthlyLastDayEnabled && localParts.isLastDayOfMonth);

        if (reminder.type === "journal") {
          if (reminder.dailyEnabled) {
            await sendPushNotification(
              fcmToken,
              "She's waiting for you",
              "A daily reminder to open your journal. The woman you are becoming wrote something for you - come read it.",
              {
                screen: "journal",
                frequency: "daily",
              },
              reminder.userId
            );
          }
          if (reminder.weeklyEnabled && reminder.daysOfWeek.includes(localParts.dayOfWeek)) {
            await sendPushNotification(
              fcmToken,
              "Your week in reflection",
              "A weekly prompt to look back at your entries, celebrate your consistency, and set your intention for the week ahead.",
              {
                screen: "journal",
                frequency: "weekly",
              },
              reminder.userId
            );
          }
          if (reminder.monthlyEnabled && monthlyDue) {
            await sendPushNotification(
              fcmToken,
              "A month of becoming",
              "A monthly reminder to revisit your journey - how much you have grown, healed, and stepped into yourself.",
              {
                screen: "journal",
                frequency: "monthly",
              },
              reminder.userId
            );
          }
        } else if (reminder.type === "mood") {
          if (reminder.dailyEnabled) {
            await sendPushNotification(
              fcmToken,
              "How are you feeling today?",
              "A daily check-in to stay connected to your inner world. Name the feeling - that is the first step of healing.",
              {
                screen: "mood",
                frequency: "daily",
              },
              reminder.userId
            );
          }
          if (reminder.weeklyEnabled && reminder.daysOfWeek.includes(localParts.dayOfWeek)) {
            await sendPushNotification(
              fcmToken,
              "Your mood this week",
              "A weekly overview of your emotional patterns. The woman who feels deeply, heals deeply - see your journey unfold.",
              {
                screen: "mood",
                frequency: "weekly",
              },
              reminder.userId
            );
          }
          if (reminder.monthlyEnabled && monthlyDue) {
            await sendPushNotification(
              fcmToken,
              "Moments of becoming",
              "Every emotion you named this month was a step into your becoming. A monthly look at the emotional growth you have made.",
              {
                screen: "mood",
                frequency: "monthly",
              },
              reminder.userId
            );
          }
        } else if (reminder.type === "affirmation") {
          const dynamicAffirmation = await getRandomAffirmation();
          const affirmationText = dynamicAffirmation
            ? `"${dynamicAffirmation.text}"`
            : "A beautiful reflection is waiting for you today.";

          if (reminder.dailyEnabled) {
            await sendPushNotification(
              fcmToken,
              "Your highest self believes in you",
              `Today's Affirmation: ${affirmationText}`,
              {
                screen: "affirmation",
                frequency: "daily",
                affirmationId: dynamicAffirmation?.id || "",
              },
              reminder.userId
            );
          }
          if (reminder.weeklyEnabled && reminder.daysOfWeek.includes(localParts.dayOfWeek)) {
            await sendPushNotification(
              fcmToken,
              "Words for your becoming",
              `Weekly Inspiration: ${affirmationText}`,
              {
                screen: "affirmation",
                frequency: "weekly",
                affirmationId: dynamicAffirmation?.id || "",
              },
              reminder.userId
            );
          }
          if (reminder.monthlyEnabled && monthlyDue) {
            await sendPushNotification(
              fcmToken,
              "A love letter from her",
              `Monthly Reflection: ${affirmationText}`,
              {
                screen: "affirmation",
                frequency: "monthly",
                affirmationId: dynamicAffirmation?.id || "",
              },
              reminder.userId
            );
          }
        }
      }
    } catch (error) {
      console.error("[SCHEDULER] Error running reminder notification scheduler:", error);
    }
  });
  console.log("[SCHEDULER] Reminder notifications scheduler started successfully.");
};
