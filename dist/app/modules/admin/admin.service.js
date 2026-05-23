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
exports.AdminService = void 0;
const prisma_1 = require("../../lib/prisma");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const formatDateUTC = (date) => date.toISOString().slice(0, 10);
const buildDateKeys = (startInclusive, days) => {
    const keys = [];
    for (let index = 0; index < days; index++) {
        const date = new Date(startInclusive);
        date.setUTCDate(startInclusive.getUTCDate() + index);
        keys.push(formatDateUTC(date));
    }
    return keys;
};
const countByDay = (items) => {
    var _a;
    const map = new Map();
    for (const item of items) {
        const key = formatDateUTC(item.createdAt);
        map.set(key, ((_a = map.get(key)) !== null && _a !== void 0 ? _a : 0) + 1);
    }
    return map;
};
const sumRevenueNetByDay = (items) => {
    var _a;
    const map = new Map();
    for (const item of items) {
        const key = formatDateUTC(item.createdAt);
        const current = (_a = map.get(key)) !== null && _a !== void 0 ? _a : 0;
        const signedAmount = item.type === "refund" ? -Math.abs(item.amount) : Math.abs(item.amount);
        map.set(key, current + signedAmount);
    }
    return map;
};
const toSeries = (dateKeys, map) => {
    return dateKeys.map((date) => {
        var _a;
        return ({
            date,
            value: Number(((_a = map.get(date)) !== null && _a !== void 0 ? _a : 0).toFixed(2)),
        });
    });
};
exports.AdminService = {
    getOverview(days) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const safeDays = Number.isFinite(days) ? Math.min(Math.max(Math.trunc(days), 1), 365) : 30;
            const now = new Date();
            const endExclusive = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
            const startInclusive = new Date(endExclusive);
            startInclusive.setUTCDate(startInclusive.getUTCDate() - safeDays);
            const dateKeys = buildDateKeys(startInclusive, safeDays);
            const [totalUsers, totalJournals, activeSubscriptions, grossRevenueAgg, refundRevenueAgg, usersInRange, journalsInRange, subscriptionsInRange, transactionsInRange,] = yield Promise.all([
                prisma_1.prisma.user.count(),
                prisma_1.prisma.journal.count(),
                prisma_1.prisma.subscription.count({
                    where: {
                        status: { in: ["active", "trial"] },
                        expiresDate: { gt: now },
                    },
                }),
                prisma_1.prisma.transaction.aggregate({
                    where: { status: "success", type: "charge" },
                    _sum: { amount: true },
                }),
                prisma_1.prisma.transaction.aggregate({
                    where: { status: "success", type: "refund" },
                    _sum: { amount: true },
                }),
                prisma_1.prisma.user.findMany({
                    where: { createdAt: { gte: startInclusive, lt: endExclusive } },
                    select: { createdAt: true },
                }),
                prisma_1.prisma.journal.findMany({
                    where: { createdAt: { gte: startInclusive, lt: endExclusive } },
                    select: { createdAt: true },
                }),
                prisma_1.prisma.subscription.findMany({
                    where: {
                        createdAt: { gte: startInclusive, lt: endExclusive },
                        status: { in: ["active", "trial"] },
                    },
                    select: { createdAt: true },
                }),
                prisma_1.prisma.transaction.findMany({
                    where: { createdAt: { gte: startInclusive, lt: endExclusive }, status: "success" },
                    select: { createdAt: true, amount: true, type: true },
                }),
            ]);
            const grossRevenue = (_a = grossRevenueAgg._sum.amount) !== null && _a !== void 0 ? _a : 0;
            const refundRevenue = (_b = refundRevenueAgg._sum.amount) !== null && _b !== void 0 ? _b : 0;
            const netRevenue = grossRevenue - refundRevenue;
            const usersByDay = countByDay(usersInRange);
            const journalsByDay = countByDay(journalsInRange);
            const subscriptionsByDay = countByDay(subscriptionsInRange);
            const revenueNetByDay = sumRevenueNetByDay(transactionsInRange);
            return {
                range: {
                    days: safeDays,
                    from: startInclusive.toISOString(),
                    to: endExclusive.toISOString(),
                    timezone: "UTC",
                },
                kpis: {
                    totalUsers,
                    totalJournals,
                    activeSubscriptions,
                    revenue: {
                        currency: "USD",
                        gross: Number(grossRevenue.toFixed(2)),
                        refunds: Number(refundRevenue.toFixed(2)),
                        net: Number(netRevenue.toFixed(2)),
                    },
                },
                charts: {
                    users: toSeries(dateKeys, usersByDay),
                    journals: toSeries(dateKeys, journalsByDay),
                    newSubscriptions: toSeries(dateKeys, subscriptionsByDay),
                    revenueNet: toSeries(dateKeys, revenueNetByDay),
                },
            };
        });
    },
    getUsers(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(Number(query.page || 1), 1);
            const limit = Math.min(Math.max(Number(query.limit || 20), 1), 200);
            const skip = (page - 1) * limit;
            const search = (query.search || "").trim();
            const status = (query.status || "").trim();
            const role = (query.role || "").trim();
            const provider = (query.provider || "").trim();
            const allowedSortBy = new Set(["createdAt", "updatedAt", "name", "email"]);
            const sortBy = allowedSortBy.has(String(query.sortBy)) ? String(query.sortBy) : "createdAt";
            const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
            const where = {};
            if (search) {
                where.OR = [{ email: { contains: search } }, { name: { contains: search } }];
            }
            if (status && ["active", "inactive", "blocked"].includes(status)) {
                where.status = status;
            }
            if (role && ["user", "admin"].includes(role)) {
                where.role = role;
            }
            if (provider && ["EMAIL", "GOOGLE", "APPLE"].includes(provider)) {
                where.provider = provider;
            }
            const [total, users] = yield Promise.all([
                prisma_1.prisma.user.count({ where }),
                prisma_1.prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        status: true,
                        provider: true,
                        isVerified: true,
                        image: true,
                        phone: true,
                        location: true,
                        createdAt: true,
                        updatedAt: true,
                        subscription: {
                            select: {
                                status: true,
                                planType: true,
                                expiresDate: true,
                                purchaseDate: true,
                                productId: true,
                            },
                        },
                    },
                }),
            ]);
            const totalPage = Math.ceil(total / limit);
            return {
                meta: { page, limit, total, totalPage },
                data: users,
            };
        });
    },
    getUserDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    provider: true,
                    providerId: true,
                    isVerified: true,
                    image: true,
                    phone: true,
                    location: true,
                    personalizationEnabled: true,
                    analyticsEnabled: true,
                    crashReportsEnabled: true,
                    createdAt: true,
                    updatedAt: true,
                    subscription: true,
                    _count: {
                        select: {
                            journals: true,
                            journalCategories: true,
                            moods: true,
                            manifestations: true,
                            savedAffirmations: true,
                            reminders: true,
                            notifications: true,
                            transactions: true,
                        },
                    },
                },
            });
            return user;
        });
    },
    updateUserStatus(adminUserId, userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (adminUserId === userId) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You cannot change your own status");
            }
            const updated = yield prisma_1.prisma.user.update({
                where: { id: userId },
                data: { status },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    updatedAt: true,
                },
            });
            return updated;
        });
    },
    updateUserRole(adminUserId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (adminUserId === userId) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You cannot change your own role");
            }
            const updated = yield prisma_1.prisma.user.update({
                where: { id: userId },
                data: { role },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    updatedAt: true,
                },
            });
            return updated;
        });
    },
};
