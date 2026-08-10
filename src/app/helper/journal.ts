import { Prisma } from "@prisma/client";
import { TJournalQuery } from "../interface/journal.interface";

export const getPagination = (query: TJournalQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

const parseCommaSeparatedValues = (value?: string) => {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getNYOffsetMs = (date: Date): number => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  const hour = Number(map.hour) === 24 ? 0 : Number(map.hour);
  const nyLocal = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second)
  );
  return nyLocal - date.getTime();
};

const getUTCFromNYTime = (nyTimeStr: string, offsetMs: number): Date => {
  const localDate = new Date(nyTimeStr + "Z");
  return new Date(localDate.getTime() - offsetMs);
};

const getDateRangeFilter = (query: TJournalQuery) => {
  const now = new Date();
  const offsetMs = getNYOffsetMs(now);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });
  const nyDateStr = `${map.year}-${map.month}-${map.day}`;
  const nyDate = new Date(nyDateStr + "T00:00:00.000Z");

  if (query.dateRange === "today") {
    const start = getUTCFromNYTime(`${nyDateStr}T00:00:00.000`, offsetMs);
    const end = getUTCFromNYTime(`${nyDateStr}T23:59:59.999`, offsetMs);

    return {
      gte: start,
      lte: end,
    };
  }

  if (query.dateRange === "thisWeek") {
    const dayOfWeek = nyDate.getUTCDay();
    const diff = nyDate.getUTCDate() - dayOfWeek;
    const startOfWeek = new Date(nyDate);
    startOfWeek.setUTCDate(diff);

    const startOfWeekStr = `${startOfWeek.getUTCFullYear()}-${String(startOfWeek.getUTCMonth() + 1).padStart(2, "0")}-${String(startOfWeek.getUTCDate()).padStart(2, "0")}`;

    const start = getUTCFromNYTime(`${startOfWeekStr}T00:00:00.000`, offsetMs);
    const end = getUTCFromNYTime(`${nyDateStr}T23:59:59.999`, offsetMs);

    return {
      gte: start,
      lte: end,
    };
  }

  if (query.dateRange === "thisMonth") {
    const startOfMonthStr = `${map.year}-${map.month}-01`;

    const start = getUTCFromNYTime(`${startOfMonthStr}T00:00:00.000`, offsetMs);
    const end = getUTCFromNYTime(`${nyDateStr}T23:59:59.999`, offsetMs);

    return {
      gte: start,
      lte: end,
    };
  }

  if (query.dateRange === "allTime") {
    return undefined;
  }

  if (query.fromDate || query.toDate) {
    const dateFilter: Prisma.DateTimeFilter = {};

    if (query.fromDate) {
      const fromDateStr = query.fromDate.split("T")[0];
      const start = getUTCFromNYTime(`${fromDateStr}T00:00:00.000`, offsetMs);
      dateFilter.gte = start;
    }

    if (query.toDate) {
      const toDateStr = query.toDate.split("T")[0];
      const end = getUTCFromNYTime(`${toDateStr}T23:59:59.999`, offsetMs);
      dateFilter.lte = end;
    }

    return dateFilter;
  }

  return undefined;
};

export const getJournalOrderBy = (
  sortBy?: TJournalQuery["sortBy"]
): Prisma.JournalOrderByWithRelationInput => {
  if (sortBy === "oldest") {
    return {
      createdAt: "asc",
    };
  }

  if (sortBy === "monthHighest") {
    return {
      createdAt: "desc",
    };
  }

  return {
    createdAt: "desc",
  };
};

export const buildJournalWhereFilter = (
  query: TJournalQuery,
  userId?: string
): Prisma.JournalWhereInput => {
  const where: Prisma.JournalWhereInput = {};

  if (userId) {
    where.userId = userId;
  }

  where.isArchived =
    query.isArchived === "true"
      ? true
      : query.isArchived === "false"
        ? false
        : false;

  if (query.search) {
    where.OR = [
      {
        title: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        prompt: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        content: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const categoryIds = [
    ...parseCommaSeparatedValues(query.categoryIds),
    ...(query.categoryId ? [query.categoryId] : []),
  ];

  if (categoryIds.length) {
    where.categoryIds = {
      hasSome: categoryIds,
    };
  }

  const moods = [
    ...parseCommaSeparatedValues(query.moods),
    ...(query.mood ? [query.mood] : []),
  ];

  if (moods.length) {
    where.mood = {
      in: moods as any,
    };
  }

  if (query.status) {
    where.status = query.status as any;
  }

  if (query.isFavorite === "true") {
    where.isFavorite = true;
  }

  const createdAtFilter = getDateRangeFilter(query);

  if (createdAtFilter) {
    where.createdAt = createdAtFilter;
  }

  return where;
};