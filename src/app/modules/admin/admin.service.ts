import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { JournalService } from "../journal/journal.service";
import { TJournalQuery } from "../../interface/journal.interface";

const formatDateUTC = (date: Date): string => date.toISOString().slice(0, 10);

const buildDateKeys = (startInclusive: Date, days: number): string[] => {
  const keys: string[] = [];
  for (let index = 0; index < days; index++) {
    const date = new Date(startInclusive);
    date.setUTCDate(startInclusive.getUTCDate() + index);
    keys.push(formatDateUTC(date));
  }
  return keys;
};

const countByDay = (items: Array<{ createdAt: Date }>): Map<string, number> => {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = formatDateUTC(item.createdAt);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
};

const sumRevenueNetByDay = (
  items: Array<{ createdAt: Date; amount: number; type: string }>,
): Map<string, number> => {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = formatDateUTC(item.createdAt);
    const current = map.get(key) ?? 0;
    const signedAmount = item.type === "refund" ? -Math.abs(item.amount) : Math.abs(item.amount);
    map.set(key, current + signedAmount);
  }
  return map;
};

const toSeries = (dateKeys: string[], map: Map<string, number>) => {
  return dateKeys.map((date) => ({
    date,
    value: Number((map.get(date) ?? 0).toFixed(2)),
  }));
};

const parsePageLimit = (pageRaw: unknown, limitRaw: unknown, maxLimit = 200) => {
  const page = Math.max(Number(pageRaw || 1), 1);
  const limit = Math.min(Math.max(Number(limitRaw || 20), 1), maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const AdminService = {
  async getOverview(days: number) {
    const safeDays = Number.isFinite(days) ? Math.min(Math.max(Math.trunc(days), 1), 365) : 30;

    const now = new Date();
    const endExclusive = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    const startInclusive = new Date(endExclusive);
    startInclusive.setUTCDate(startInclusive.getUTCDate() - safeDays);

    const dateKeys = buildDateKeys(startInclusive, safeDays);

    const [
      totalUsers,
      totalJournals,
      activeSubscriptions,
      grossRevenueAgg,
      refundRevenueAgg,
      usersInRange,
      journalsInRange,
      subscriptionsInRange,
      transactionsInRange,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.journal.count(),
      prisma.subscription.count({
        where: {
          status: { in: ["active", "trial"] },
          expiresDate: { gt: now },
        },
      }),
      prisma.transaction.aggregate({
        where: { status: "success", type: "charge" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { status: "success", type: "refund" },
        _sum: { amount: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startInclusive, lt: endExclusive } },
        select: { createdAt: true },
      }),
      prisma.journal.findMany({
        where: { createdAt: { gte: startInclusive, lt: endExclusive } },
        select: { createdAt: true },
      }),
      prisma.subscription.findMany({
        where: {
          createdAt: { gte: startInclusive, lt: endExclusive },
          status: { in: ["active", "trial"] },
        },
        select: { createdAt: true },
      }),
      prisma.transaction.findMany({
        where: { createdAt: { gte: startInclusive, lt: endExclusive }, status: "success" },
        select: { createdAt: true, amount: true, type: true },
      }),
    ]);

    const grossRevenue = grossRevenueAgg._sum.amount ?? 0;
    const refundRevenue = refundRevenueAgg._sum.amount ?? 0;
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
  },

  async getUsers(query: import("./admin.types").TAdminUserListQuery) {
    const { page, limit, skip } = parsePageLimit(query.page, query.limit, 200);

    const search = (query.search || "").trim();
    const status = (query.status || "").trim();
    const role = (query.role || "").trim();
    const provider = (query.provider || "").trim();

    const allowedSortBy = new Set(["createdAt", "updatedAt", "name", "email"]);
    const sortBy = allowedSortBy.has(String(query.sortBy)) ? String(query.sortBy) : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const where: any = {};

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

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder } as any,
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
  },

  async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
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
  },

  async updateUserStatus(adminUserId: string, userId: string, status: "active" | "inactive" | "blocked") {
    if (adminUserId === userId) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot change your own status");
    }

    const updated = await prisma.user.update({
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
  },

  async updateUserRole(adminUserId: string, userId: string, role: "user" | "admin") {
    if (adminUserId === userId) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot change your own role");
    }

    const updated = await prisma.user.update({
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
  },

  async getAllJournals(query: TJournalQuery) {
    return JournalService.getAllJournals(query);
  },

  async getManifestations(query: import("./admin.types").TAdminManifestationListQuery) {
    const { page, limit, skip } = parsePageLimit(query.page, query.limit, 200);

    const search = (query.search || "").trim();
    const userId = (query.userId || "").trim();

    const allowedSortBy = new Set(["createdAt", "updatedAt", "name"]);
    const sortBy = allowedSortBy.has(String(query.sortBy)) ? String(query.sortBy) : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const where: any = {};
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
        { feeling: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, manifestations] = await Promise.all([
      prisma.manifestation.count({ where }),
      prisma.manifestation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder } as any,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    const totalPage = Math.ceil(total / limit);
    return { meta: { page, limit, total, totalPage }, data: manifestations };
  },

  async getMoodAnalytics(days: number) {
    const safeDays = Number.isFinite(days) ? Math.min(Math.max(Math.trunc(days), 1), 365) : 30;

    const now = new Date();
    const endExclusive = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    const startInclusive = new Date(endExclusive);
    startInclusive.setUTCDate(startInclusive.getUTCDate() - safeDays);

    const dateKeys = buildDateKeys(startInclusive, safeDays);

    const moods = await prisma.mood.findMany({
      where: { date: { gte: startInclusive, lt: endExclusive } },
      select: { date: true, energy: true, userId: true, activities: true },
      orderBy: { date: "asc" },
    });

    const totalEntries = moods.length;
    const uniqueUsers = new Set(moods.map((m) => m.userId)).size;

    const dailyTotalMap = new Map<string, number>();
    const energyCountsMap = new Map<string, number>();
    const activityCountsMap = new Map<string, number>();

    for (const mood of moods) {
      const dateKey = formatDateUTC(mood.date);
      dailyTotalMap.set(dateKey, (dailyTotalMap.get(dateKey) ?? 0) + 1);

      const energyKey = String(mood.energy || "Unknown");
      energyCountsMap.set(energyKey, (energyCountsMap.get(energyKey) ?? 0) + 1);

      for (const activity of mood.activities || []) {
        const key = String(activity || "").trim();
        if (!key) continue;
        activityCountsMap.set(key, (activityCountsMap.get(key) ?? 0) + 1);
      }
    }

    const energyCounts = [...energyCountsMap.entries()]
      .map(([energy, count]) => ({ energy, count }))
      .sort((a, b) => b.count - a.count);

    const topActivities = [...activityCountsMap.entries()]
      .map(([activity, count]) => ({ activity, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      range: {
        days: safeDays,
        from: startInclusive.toISOString(),
        to: endExclusive.toISOString(),
        timezone: "UTC",
      },
      totals: {
        totalEntries,
        uniqueUsers,
      },
      energyCounts,
      topActivities,
      charts: {
        dailyMoods: toSeries(dateKeys, dailyTotalMap),
      },
    };
  },
};
