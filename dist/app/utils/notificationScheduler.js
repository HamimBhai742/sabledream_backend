"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNotificationScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../lib/prisma");
const sendNotification_1 = require("./sendNotification");
// Helper to get day name in uppercase
const getDayOfWeekName = (date) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[date.getDay()];
};
// Helper to fetch a dynamic affirmation from the database
const getRandomAffirmation = (goal) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const whereClause = {};
        if (goal) {
            whereClause.goal = goal;
        }
        const count = yield prisma_1.prisma.affirmation.count({ where: whereClause });
        if (count === 0)
            return null;
        const skip = Math.floor(Math.random() * count);
        const affirmations = yield prisma_1.prisma.affirmation.findMany({
            where: whereClause,
            skip: skip,
            take: 1,
        });
        return affirmations[0];
    }
    catch (error) {
        console.error("[SCHEDULER] Failed to fetch dynamic affirmation:", error);
        return null;
    }
});
const startNotificationScheduler = () => {
    // Run every minute to check and trigger scheduled notifications
    node_cron_1.default.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const now = new Date();
            // Format hour and minute to match time format, e.g. "08:00"
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const currentTime = `${hours}:${minutes}`;
            const currentDayOfMonth = now.getDate();
            const currentDayOfWeek = getDayOfWeekName(now);
            console.log(`[SCHEDULER] Checking reminders for Time: ${currentTime}, Day of Month: ${currentDayOfMonth}, Day of Week: ${currentDayOfWeek}`);
            // Fetch all reminders that match the current time
            const reminders = yield prisma_1.prisma.reminder.findMany({
                where: {
                    time: currentTime,
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
                if (!reminder.user.fcmToken)
                    continue;
                const fcmToken = reminder.user.fcmToken;
                // Build notifications based on type and frequency enabled flags
                if (reminder.type === "journal") {
                    if (reminder.dailyEnabled) {
                        yield (0, sendNotification_1.sendPushNotification)(fcmToken, "She's waiting for you ✍️", "A daily reminder to open your journal. The woman you are becoming wrote something for you — come read it.", {
                            screen: "journal",
                            frequency: "daily",
                        }, reminder.userId);
                    }
                    if (reminder.weeklyEnabled && reminder.daysOfWeek.includes(currentDayOfWeek)) {
                        yield (0, sendNotification_1.sendPushNotification)(fcmToken, "Your week in reflection 🌿", "A weekly prompt to look back at your entries, celebrate your consistency, and set your intention for the week ahead.", {
                            screen: "journal",
                            frequency: "weekly",
                        }, reminder.userId);
                    }
                    if (reminder.daysOfMonth && reminder.daysOfMonth.includes(currentDayOfMonth)) {
                        if (reminder.monthlyEnabled) {
                            yield (0, sendNotification_1.sendPushNotification)(fcmToken, "A month of becoming 🗓️", "At the end of every month, a reminder to revisit your journey — how much you have grown, healed, and stepped into yourself.", {
                                screen: "journal",
                                frequency: "monthly",
                            }, reminder.userId);
                        }
                    }
                }
                else if (reminder.type === "mood") {
                    if (reminder.dailyEnabled) {
                        yield (0, sendNotification_1.sendPushNotification)(fcmToken, "How are you feeling today? 💖", "A daily midday check-in to stay connected to your inner world. Name the feeling — that is the first step of healing.", {
                            screen: "mood",
                            frequency: "daily",
                        }, reminder.userId);
                    }
                    if (reminder.weeklyEnabled && reminder.daysOfWeek.includes(currentDayOfWeek)) {
                        yield (0, sendNotification_1.sendPushNotification)(fcmToken, "Your mood this week 🌊", "A weekly overview of your emotional patterns. The woman who feels deeply, heals deeply — see your journey unfold.", {
                            screen: "mood",
                            frequency: "weekly",
                        }, reminder.userId);
                    }
                    if (reminder.daysOfMonth && reminder.daysOfMonth.includes(currentDayOfMonth)) {
                        if (reminder.monthlyEnabled) {
                            yield (0, sendNotification_1.sendPushNotification)(fcmToken, "Moments of becoming 🌸", "Every emotion you named this month was a step into your becoming. A monthly look at the emotional growth you have made.", {
                                screen: "mood",
                                frequency: "monthly",
                            }, reminder.userId);
                        }
                    }
                }
                else if (reminder.type === "affirmation") {
                    // Dynamic Affirmation Loading to show actual dynamic texts inside push notifications!
                    const dynamicAffirmation = yield getRandomAffirmation();
                    const affirmationText = dynamicAffirmation
                        ? `"${dynamicAffirmation.text}"`
                        : "A beautiful reflection is waiting for you today.";
                    if (reminder.dailyEnabled) {
                        yield (0, sendNotification_1.sendPushNotification)(fcmToken, "Your highest self believes in you 💌", `Today's Affirmation: ${affirmationText}`, {
                            screen: "affirmation",
                            frequency: "daily",
                            affirmationId: (dynamicAffirmation === null || dynamicAffirmation === void 0 ? void 0 : dynamicAffirmation.id) || "",
                        }, reminder.userId);
                    }
                    if (reminder.weeklyEnabled && reminder.daysOfWeek.includes(currentDayOfWeek)) {
                        yield (0, sendNotification_1.sendPushNotification)(fcmToken, "Words for your becoming ✨", `Weekly Inspiration: ${affirmationText}`, {
                            screen: "affirmation",
                            frequency: "weekly",
                            affirmationId: (dynamicAffirmation === null || dynamicAffirmation === void 0 ? void 0 : dynamicAffirmation.id) || "",
                        }, reminder.userId);
                    }
                    if (reminder.daysOfMonth && reminder.daysOfMonth.includes(currentDayOfMonth)) {
                        if (reminder.monthlyEnabled) {
                            yield (0, sendNotification_1.sendPushNotification)(fcmToken, "A love letter from her 💗", `Monthly Reflection: ${affirmationText}`, {
                                screen: "affirmation",
                                frequency: "monthly",
                                affirmationId: (dynamicAffirmation === null || dynamicAffirmation === void 0 ? void 0 : dynamicAffirmation.id) || "",
                            }, reminder.userId);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error("[SCHEDULER] Error running reminder notification scheduler:", error);
        }
    }));
    console.log("[SCHEDULER] Reminder notifications scheduler started successfully.");
};
exports.startNotificationScheduler = startNotificationScheduler;
