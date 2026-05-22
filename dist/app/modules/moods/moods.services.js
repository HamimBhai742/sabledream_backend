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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodService = void 0;
const prisma_1 = require("../../lib/prisma");
const createOrUpdateMood = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const moodDate = new Date(data.date);
    // Normalize date to start of day to ensure one entry per day
    moodDate.setHours(0, 0, 0, 0);
    return yield prisma_1.prisma.mood.upsert({
        where: {
            userId_date: {
                userId,
                date: moodDate,
            },
        },
        update: {
            energy: data.energy,
            activities: data.activities,
        },
        create: {
            userId,
            energy: data.energy,
            activities: data.activities,
            date: moodDate,
        },
    });
});
const getMoodByDate = (userId, date) => __awaiter(void 0, void 0, void 0, function* () {
    const moodDate = new Date(date);
    moodDate.setHours(0, 0, 0, 0);
    return yield prisma_1.prisma.mood.findUnique({
        where: {
            userId_date: {
                userId,
                date: moodDate,
            },
        },
    });
});
const getMoodsByDateRange = (userId, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.mood.findMany({
        where: {
            userId,
            date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        },
        orderBy: {
            date: 'asc',
        },
    });
});
const getMoodsByMonth = (userId, year, month) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return yield prisma_1.prisma.mood.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: {
            date: 'asc',
        },
    });
});
const getMoodHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Current Week Data (Monday to Sunday) for the chart
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    // Calculate Monday of the current week
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(new Date().setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const weeklyMoods = yield prisma_1.prisma.mood.findMany({
        where: {
            userId,
            date: {
                gte: startOfWeek,
                lte: endOfWeek,
            },
        },
        orderBy: {
            date: 'asc',
        },
    });
    // 2. Recent 10 entries for the list
    const recentEntries = yield prisma_1.prisma.mood.findMany({
        where: {
            userId,
        },
        orderBy: {
            date: 'desc',
        },
        take: 10,
    });
    const getFeelingType = (energy) => {
        const lowerEnergy = energy.toLowerCase();
        const lowMoods = ['sad', 'angry', 'overwhelmed', 'anxious'];
        const calmMoods = ['calm', 'sat', 'clam']; // images showed 'clam' or 'sat'
        if (lowMoods.includes(lowerEnergy))
            return 'Low';
        if (calmMoods.includes(lowerEnergy))
            return 'Clam';
        return 'High';
    };
    const mapMoodWithType = (mood) => (Object.assign(Object.assign({}, mood), { feelingType: getFeelingType(mood.energy), day: new Date(mood.date).toLocaleDateString('en-US', { weekday: 'short' }) }));
    return {
        weeklyMoods: weeklyMoods.map(mapMoodWithType),
        recentEntries: recentEntries.map(mapMoodWithType),
    };
});
exports.MoodService = {
    createOrUpdateMood,
    getMoodByDate,
    getMoodsByDateRange,
    getMoodHistory,
    getMoodsByMonth
};
