import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { JournalService } from "../journal/journal.service";
import { TJournalQuery } from "../../interface/journal.interface";
import { deleteFromImageKit } from "../../utils/uploadImageKit";
import { ensurePermanentUserId } from "../../utils/generatePermanentUserId";
import { TIME_OF_DAY_BUCKETS, TARGET_TIMEZONE } from "../../config/activityMetrics.config";

const getHourInTimezone = (date: Date, timezone: string = TARGET_TIMEZONE): number => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hourPart = parts.find((p) => p.type === "hour");
  const hour = hourPart ? Number(hourPart.value) : date.getUTCHours();
  return hour % 24;
};

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

const parseDateOrUndefined = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
};

const getProfileImageFileOrUrl = (image?: string | null) => {
  if (!image?.includes("imagekit.io")) return null;
  return image;
};

const deleteImageKitAsset = async (fileIdOrUrl?: string | null) => {
  if (!fileIdOrUrl) return;

  try {
    await deleteFromImageKit(fileIdOrUrl);
  } catch (error) {
    console.error(`Failed to delete ImageKit asset ${fileIdOrUrl}:`, error);
  }
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

  async getUsers(query: import("./admin.types").TAdminUserListQuery & { capacityFlag?: string }) {
    const { page, limit, skip } = parsePageLimit(query.page, query.limit, 200);

    const search = (query.search || "").trim();
    const status = (query.status || "").trim();
    const role = (query.role || "").trim();
    const provider = (query.provider || "").trim();
    const capacityFlagParam = query.capacityFlag === "true" ? true : query.capacityFlag === "false" ? false : undefined;

    const allowedSortBy = new Set(["createdAt", "updatedAt", "name", "email"]);
    const sortBy = allowedSortBy.has(String(query.sortBy)) ? String(query.sortBy) : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { permanentId: { contains: search } },
      ];
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
          permanentId: true,
          name: true,
          email: true,
          role: true,
          status: true,
          provider: true,
          isVerified: true,
          image: true,
          phone: true,
          location: true,
          monthlyTokenLimit: true,
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

    const currentMonthYear = new Date().toISOString().slice(0, 7); // e.g. "2026-07"
    const userIds = users.map((u) => u.id);

    const monthlyUsages = await prisma.userMonthlyUsage.findMany({
      where: {
        userId: { in: userIds },
        monthYear: currentMonthYear,
      },
    });

    const usageMap = new Map<string, number>();
    monthlyUsages.forEach((mu) => {
      usageMap.set(mu.userId, mu.tokensUsed);
    });

    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const permanentId = await ensurePermanentUserId(u.id, u.permanentId);
        const tokensUsed = usageMap.get(u.id) || 0;
        const limit = u.monthlyTokenLimit || 50000;
        const usagePercentage = Number(((tokensUsed / limit) * 100).toFixed(2));
        const capacityFlag = usagePercentage >= 90;

        return {
          ...u,
          permanentId,
          tokensUsed,
          usagePercentage,
          capacityFlag,
        };
      })
    );

    const finalUsers = capacityFlagParam !== undefined
      ? enrichedUsers.filter((u) => u.capacityFlag === capacityFlagParam)
      : enrichedUsers;

    const filteredTotal = capacityFlagParam !== undefined ? finalUsers.length : total;
    const totalPage = Math.ceil(filteredTotal / limit);

    return {
      meta: { page, limit, total: filteredTotal, totalPage },
      data: finalUsers,
    };
  },

  async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        permanentId: true,
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
        monthlyTokenLimit: true,
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

  async deleteUser(adminUserId: string, userId: string) {
    if (adminUserId === userId) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot delete your own account");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        journals: {
          select: {
            imageKey: true,
          },
        },
        manifestations: {
          select: {
            imageKey: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    await Promise.all([
      deleteImageKitAsset(getProfileImageFileOrUrl(user.image)),
      ...user.journals.map((journal) => deleteImageKitAsset(journal.imageKey)),
      ...user.manifestations.map((manifestation) =>
        deleteImageKitAsset(manifestation.imageKey),
      ),
    ]);

    await prisma.$transaction(async (tx) => {
      if (user.permanentId) {
        await tx.deletedUserId.upsert({
          where: { permanentId: user.permanentId },
          create: { permanentId: user.permanentId },
          update: {},
        });
      }
      await tx.savedAffirmation.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.reminder.deleteMany({ where: { userId } });
      await tx.mood.deleteMany({ where: { userId } });
      await tx.manifestation.deleteMany({ where: { userId } });
      await tx.subscription.deleteMany({ where: { userId } });
      await tx.transaction.deleteMany({ where: { userId } });
      await tx.journal.deleteMany({ where: { userId } });
      await tx.journalCategory.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    return null;
  },

  async deleteJournal(journalId: string) {
    const journal = await prisma.journal.findUnique({
      where: { id: journalId },
    });

    if (!journal) {
      throw new AppError(httpStatus.NOT_FOUND, "Journal not found");
    }

    await deleteImageKitAsset(journal.imageKey);

    await prisma.$transaction(async (tx) => {
      for (const categoryId of journal.categoryIds) {
        const category = await tx.journalCategory.findFirst({
          where: {
            id: categoryId,
            userId: journal.userId,
          },
        });

        if (category) {
          await tx.journalCategory.update({
            where: {
              id: categoryId,
            },
            data: {
              journalIds: category.journalIds.filter((id) => id !== journalId),
            },
          });
        }
      }

      await tx.journal.delete({
        where: {
          id: journalId,
        },
      });
    });

    return null;
  },

  async deleteManifestation(manifestationId: string) {
    const manifestation = await prisma.manifestation.findUnique({
      where: { id: manifestationId },
    });

    if (!manifestation) {
      throw new AppError(httpStatus.NOT_FOUND, "Manifestation not found");
    }

    await deleteImageKitAsset(manifestation.imageKey);

    await prisma.manifestation.delete({
      where: {
        id: manifestationId,
      },
    });

    return null;
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

  async getActiveSubscriptions(query: import("./admin.types").TAdminSubscriptionListQuery) {
    const { page, limit, skip } = parsePageLimit(query.page, query.limit, 200);
    const now = new Date();

    const status = (query.status || "").trim();
    const planType = (query.planType || "").trim();
    const search = (query.search || "").trim();

    const allowedSortBy = new Set(["createdAt", "updatedAt", "expiresDate", "purchaseDate"]);
    const sortBy = allowedSortBy.has(String(query.sortBy)) ? String(query.sortBy) : "expiresDate";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const where: any = {
      status: { in: ["active", "trial"] },
      expiresDate: { gt: now },
    };

    if (status && ["active", "trial", "expired"].includes(status)) {
      where.status = status === "expired" ? "expired" : { in: [status] };
      if (status === "expired") {
        delete where.expiresDate;
      }
    }

    if (planType && ["free", "monthly", "annual"].includes(planType)) {
      where.planType = planType;
    }

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [total, subscriptions] = await Promise.all([
      prisma.subscription.count({ where }),
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder } as any,
        include: {
          user: { select: { id: true, name: true, email: true, status: true, role: true } },
        },
      }),
    ]);

    const totalPage = Math.ceil(total / limit);
    return { meta: { page, limit, total, totalPage }, data: subscriptions };
  },

  async getTransactions(query: import("./admin.types").TAdminTransactionListQuery) {
    const { page, limit, skip } = parsePageLimit(query.page, query.limit, 200);

    const type = (query.type || "").trim();
    const status = (query.status || "").trim();
    const currency = (query.currency || "").trim();
    const userId = (query.userId || "").trim();
    const search = (query.search || "").trim();

    const fromDate = parseDateOrUndefined(query.fromDate);
    const toDate = parseDateOrUndefined(query.toDate);

    const allowedSortBy = new Set(["createdAt", "amount"]);
    const sortBy = allowedSortBy.has(String(query.sortBy)) ? String(query.sortBy) : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const where: any = {};
    if (type && ["charge", "refund"].includes(type)) where.type = type;
    if (status) where.status = status;
    if (currency) where.currency = currency;
    if (userId) where.userId = userId;

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder } as any,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    const totalPage = Math.ceil(total / limit);
    return { meta: { page, limit, total, totalPage }, data: transactions };
  },

  async getSubscriptionSummary() {
    const now = new Date();

    const [
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions,
      totalTransactions,
    ] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({
        where: { status: "active", expiresDate: { gt: now } },
      }),
      prisma.subscription.count({
        where: { status: "trial", expiresDate: { gt: now } },
      }),
      prisma.subscription.count({
        where: { status: "expired" },
      }),
      prisma.transaction.count(),
    ]);

    return {
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        trial: trialSubscriptions,
        expired: expiredSubscriptions,
      },
      transactions: {
        total: totalTransactions,
      },
      asOf: now.toISOString(),
    };
  },

  async getUserActivityMetrics(monthYear?: string) {
    const targetMonthYear = monthYear || new Date().toISOString().slice(0, 7);

    const [yearStr, monthStr] = targetMonthYear.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr) - 1;

    const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));

    const aiSessionsCount = await prisma.eventLog.count({
      where: {
        eventName: "ai_chat_session_start",
        timestamp: { gte: startDate, lt: endDate },
      },
    });

    const journalEntriesCount = await prisma.journal.count({
      where: {
        createdAt: { gte: startDate, lt: endDate },
      },
    });

    const aiJournalRatio = journalEntriesCount === 0
      ? "-"
      : Number((aiSessionsCount / journalEntriesCount).toFixed(2));

    const aiMessagesCount = await prisma.eventLog.count({
      where: {
        eventName: "ai_message_sent",
        timestamp: { gte: startDate, lt: endDate },
      },
    });

    const conversationDepth = aiSessionsCount === 0
      ? 0
      : Number((aiMessagesCount / aiSessionsCount).toFixed(2));

    const [eventLogsInRange, journalsInRange] = await Promise.all([
      prisma.eventLog.findMany({
        where: {
          eventName: { in: ["ai_chat_session_start", "journal_entry_saved"] },
          timestamp: { gte: startDate, lt: endDate },
        },
        select: { timestamp: true, localTimestamp: true, utcOffset: true },
      }),
      prisma.journal.findMany({
        where: {
          createdAt: { gte: startDate, lt: endDate },
        },
        select: { createdAt: true },
      }),
    ]);

    let morningCount = 0;
    let middayCount = 0;
    let nightCount = 0;

    const categorizeHour = (hour: number) => {
      if (hour >= TIME_OF_DAY_BUCKETS.MORNING.startHour && hour <= TIME_OF_DAY_BUCKETS.MORNING.endHour) {
        morningCount++;
      } else if (hour >= TIME_OF_DAY_BUCKETS.MIDDAY.startHour && hour <= TIME_OF_DAY_BUCKETS.MIDDAY.endHour) {
        middayCount++;
      } else {
        nightCount++;
      }
    };

    eventLogsInRange.forEach((log) => {
      const hour = getHourInTimezone(log.timestamp, TARGET_TIMEZONE);
      categorizeHour(hour);
    });

    journalsInRange.forEach((j) => {
      const hour = getHourInTimezone(j.createdAt, TARGET_TIMEZONE);
      categorizeHour(hour);
    });

    const totalEvents = morningCount + middayCount + nightCount;
    const timeOfDayDistribution = {
      timezone: TARGET_TIMEZONE,
      morningPercentage: totalEvents === 0 ? 0 : Number(((morningCount / totalEvents) * 100).toFixed(2)),
      middayPercentage: totalEvents === 0 ? 0 : Number(((middayCount / totalEvents) * 100).toFixed(2)),
      nightPercentage: totalEvents === 0 ? 0 : Number(((nightCount / totalEvents) * 100).toFixed(2)),
      bucketCounts: {
        morning: morningCount,
        midday: middayCount,
        night: nightCount,
        total: totalEvents,
      },
      bucketsConfig: TIME_OF_DAY_BUCKETS,
    };

    const journalCountsPerUserRaw = await prisma.journal.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: startDate, lt: endDate },
      },
      _count: {
        id: true,
      },
    });

    const userIdsWithJournals = journalCountsPerUserRaw.map((item) => item.userId);
    const usersInfo = await prisma.user.findMany({
      where: { id: { in: userIdsWithJournals } },
      select: { id: true, permanentId: true, name: true, email: true },
    });

    const userInfoMap = new Map(usersInfo.map((u) => [u.id, u]));

    const journalCountByMonthPerUser = journalCountsPerUserRaw.map((item) => {
      const userInfo = userInfoMap.get(item.userId);
      return {
        userId: item.userId,
        permanentId: userInfo?.permanentId || null,
        userName: userInfo?.name || "Unknown",
        userEmail: userInfo?.email || "Unknown",
        journalCount: item._count.id,
        monthYear: targetMonthYear,
      };
    });

    return {
      monthYear: targetMonthYear,
      aiJournalRatio,
      conversationDepth,
      timeOfDayDistribution,
      journalCountByMonthPerUser,
    };
  },

  async getEventLogs(query: {
    page?: string;
    limit?: string;
    startDate?: string;
    endDate?: string;
    eventName?: string;
    userId?: string;
    search?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.eventName) {
      where.eventName = query.eventName;
    }

    if (query.userId) {
      where.OR = [
        { userId: query.userId },
        { permanentUserId: query.userId },
      ];
    }

    if (query.search) {
      where.OR = [
        { eventName: { contains: query.search } },
        { permanentUserId: { contains: query.search } },
        { sessionId: { contains: query.search } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) {
        where.timestamp.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.timestamp.lte = new Date(query.endDate);
      }
    }

    const [total, eventLogs] = await Promise.all([
      prisma.eventLog.count({ where }),
      prisma.eventLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
      }),
    ]);

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: eventLogs,
    };
  },

  async exportEventLogsCSV(query: { startDate?: string; endDate?: string; eventName?: string }) {
    const where: any = {};

    if (query.eventName) {
      where.eventName = query.eventName;
    }

    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) {
        where.timestamp.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.timestamp.lte = new Date(query.endDate);
      }
    }

    const eventLogs = await prisma.eventLog.findMany({
      where,
      orderBy: { timestamp: "asc" },
    });

    const csvRows = [
      ["Session ID", "Permanent User ID", "Event Name", "Timestamp (UTC)", "Local Timestamp", "UTC Offset", "Message Char Length"].join(","),
    ];

    eventLogs.forEach((log) => {
      const row = [
        `"${log.sessionId}"`,
        `"${log.permanentUserId}"`,
        `"${log.eventName}"`,
        `"${log.timestamp.toISOString()}"`,
        `"${log.localTimestamp || ""}"`,
        `"${log.utcOffset || ""}"`,
        log.charLength !== null && log.charLength !== undefined ? log.charLength : "",
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  },

  async exportUserActivityMetricsCSV(monthYear?: string) {
    const metrics = await this.getUserActivityMetrics(monthYear);
    const targetMonth = metrics.monthYear;

    const csvRows: string[] = [];

    // Summary Metrics Section
    csvRows.push("--- SUMMARY METRICS ---");
    csvRows.push("Month/Year,AI Journal Ratio,Conversation Depth,Total Logs");
    csvRows.push(
      `"${targetMonth}","${metrics.aiJournalRatio}","${metrics.conversationDepth}","${metrics.timeOfDayDistribution.bucketCounts.total}"`
    );
    csvRows.push("");

    // Time of Day Distribution Section
    csvRows.push(`--- TIME OF DAY DISTRIBUTION (Timezone: ${metrics.timeOfDayDistribution.timezone}) ---`);
    csvRows.push("Time Bucket,Count,Percentage");

    const morningLabel = metrics.timeOfDayDistribution.bucketsConfig.MORNING.label;
    const middayLabel = metrics.timeOfDayDistribution.bucketsConfig.MIDDAY.label;
    const nightLabel = metrics.timeOfDayDistribution.bucketsConfig.NIGHT.label;

    csvRows.push(
      `"${morningLabel}","${metrics.timeOfDayDistribution.bucketCounts.morning}","${metrics.timeOfDayDistribution.morningPercentage}%"`
    );
    csvRows.push(
      `"${middayLabel}","${metrics.timeOfDayDistribution.bucketCounts.midday}","${metrics.timeOfDayDistribution.middayPercentage}%"`
    );
    csvRows.push(
      `"${nightLabel}","${metrics.timeOfDayDistribution.bucketCounts.night}","${metrics.timeOfDayDistribution.nightPercentage}%"`
    );
    csvRows.push("");

    // User Journal Activity Section
    csvRows.push("--- USER JOURNAL ACTIVITY ---");
    csvRows.push("User ID,Permanent ID,User Name,User Email,Journal Count");

    metrics.journalCountByMonthPerUser.forEach((userActivity) => {
      const escapedUserId = String(userActivity.userId || "").replace(/"/g, '""');
      const escapedPermanentId = String(userActivity.permanentId || "").replace(/"/g, '""');
      const escapedName = String(userActivity.userName || "").replace(/"/g, '""');
      const escapedEmail = String(userActivity.userEmail || "").replace(/"/g, '""');
      const journalCount = userActivity.journalCount;

      csvRows.push(
        `"${escapedUserId}","${escapedPermanentId}","${escapedName}","${escapedEmail}","${journalCount}"`
      );
    });

    return csvRows.join("\n");
  },
};
