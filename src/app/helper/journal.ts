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

export const getOffsetMs = (date: Date, timeZone: string): number => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
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
    const local = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      hour,
      Number(map.minute),
      Number(map.second)
    );
    return local - date.getTime();
  } catch (error) {
    console.error(`[TimeZone] Invalid timezone ${timeZone}:`, error);
    return 0;
  }
};

export const getUTCFromLocalTime = (localTimeStr: string, timeZone: string): Date => {
  if (localTimeStr.includes("Z") || /[+-]\d{2}:?\d{2}$/.test(localTimeStr)) {
    return new Date(localTimeStr);
  }

  const tempDate = new Date(localTimeStr.endsWith("Z") ? localTimeStr : localTimeStr + "Z");
  if (isNaN(tempDate.getTime())) {
    return new Date(localTimeStr);
  }

  const offsetMs = getOffsetMs(tempDate, timeZone);
  return new Date(tempDate.getTime() - offsetMs);
};

const getDateRangeFilter = (query: TJournalQuery, timeZone: string) => {
  const now = new Date();
  const offsetMs = getOffsetMs(now, timeZone);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
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
    const start = getUTCFromLocalTime(`${nyDateStr}T00:00:00.000`, timeZone);
    const end = getUTCFromLocalTime(`${nyDateStr}T23:59:59.999`, timeZone);

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

    const start = getUTCFromLocalTime(`${startOfWeekStr}T00:00:00.000`, timeZone);
    const end = getUTCFromLocalTime(`${nyDateStr}T23:59:59.999`, timeZone);

    return {
      gte: start,
      lte: end,
    };
  }

  if (query.dateRange === "thisMonth") {
    const startOfMonthStr = `${map.year}-${map.month}-01`;

    const start = getUTCFromLocalTime(`${startOfMonthStr}T00:00:00.000`, timeZone);
    const end = getUTCFromLocalTime(`${nyDateStr}T23:59:59.999`, timeZone);

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
      const start = getUTCFromLocalTime(`${fromDateStr}T00:00:00.000`, timeZone);
      dateFilter.gte = start;
    }

    if (query.toDate) {
      const toDateStr = query.toDate.split("T")[0];
      const end = getUTCFromLocalTime(`${toDateStr}T23:59:59.999`, timeZone);
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
  userId?: string,
  timeZone: string = "UTC"
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

  // --- Mood filter (explicit filter by mood, comma-separated or single) ---
  const moods = [
    ...parseCommaSeparatedValues(query.moods),
    ...(query.mood ? [query.mood] : []),
  ];

  if (moods.length) {
    where.mood = {
      in: moods.map((m) => m.toUpperCase()) as any,
    };
  }

  // --- Text search across title, prompt, content, and mood ---
  if (query.search) {
    const searchTerm = query.search.trim();

    // Check if the search term matches any known mood value (case-insensitive)
    const validMoods = ["HAPPY", "SAD", "CALM", "GRATEFUL", "ANXIOUS", "EXCITED", "NEUTRAL"];
    const matchedMood = validMoods.find(
      (m) => m === searchTerm.toUpperCase()
    );

    const searchClauses: Prisma.JournalWhereInput[] = [
      {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        prompt: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        content: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];

    // If search term matches a mood, also search by mood field
    if (matchedMood) {
      searchClauses.push({
        mood: matchedMood as any,
      });
    }

    where.OR = searchClauses;
  }

  // --- Category filter ---
  const categoryIds = [
    ...parseCommaSeparatedValues(query.categoryIds),
    ...(query.categoryId ? [query.categoryId] : []),
  ];

  if (categoryIds.length) {
    where.categoryIds = {
      hasSome: categoryIds,
    };
  }

  if (query.status) {
    where.status = query.status as any;
  }

  if (query.isFavorite === "true") {
    where.isFavorite = true;
  }

  const createdAtFilter = getDateRangeFilter(query, timeZone);

  if (createdAtFilter) {
    where.createdAt = createdAtFilter;
  }

  return where;
};