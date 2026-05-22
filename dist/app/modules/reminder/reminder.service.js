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
exports.ReminderService = void 0;
const prisma_1 = require("../../lib/prisma");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const getReminderSettings = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const reminderTypes = ["journal", "mood", "affirmation"];
    const existingReminders = yield prisma_1.prisma.reminder.findMany({
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
        yield prisma_1.prisma.reminder.createMany({
            data: initData,
        });
        // Refetch to return complete set of 3 reminder settings
        return prisma_1.prisma.reminder.findMany({
            where: { userId },
        });
    }
    return existingReminders;
});
const updateReminderSettings = (userId, type, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const allowedTypes = ["journal", "mood", "affirmation"];
    if (!allowedTypes.includes(type)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid reminder type. Allowed types: ${allowedTypes.join(", ")}`);
    }
    // Validate daysOfMonth are within 1-31 range
    if (data.daysOfMonth) {
        for (const day of data.daysOfMonth) {
            if (day < 1 || day > 31) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Days of month must be between 1 and 31");
            }
        }
    }
    // Normalize daysOfWeek to uppercase and validate
    if (data.daysOfWeek) {
        const allowedDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
        data.daysOfWeek = data.daysOfWeek.map((day) => day.toUpperCase());
        for (const day of data.daysOfWeek) {
            if (!allowedDays.includes(day)) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid day of week: ${day}. Allowed days: ${allowedDays.join(", ")}`);
            }
        }
    }
    const reminder = yield prisma_1.prisma.reminder.upsert({
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
            dailyEnabled: (_a = data.dailyEnabled) !== null && _a !== void 0 ? _a : false,
            weeklyEnabled: (_b = data.weeklyEnabled) !== null && _b !== void 0 ? _b : false,
            monthlyEnabled: (_c = data.monthlyEnabled) !== null && _c !== void 0 ? _c : false,
            daysOfMonth: (_d = data.daysOfMonth) !== null && _d !== void 0 ? _d : [],
            daysOfWeek: (_e = data.daysOfWeek) !== null && _e !== void 0 ? _e : [],
            time: (_f = data.time) !== null && _f !== void 0 ? _f : "08:00",
        },
    });
    return reminder;
});
exports.ReminderService = {
    getReminderSettings,
    updateReminderSettings,
};
