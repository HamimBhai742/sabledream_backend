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

const getDateRangeFilter = (query: TJournalQuery) => {
  const now = new Date();

  if (query.dateRange === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return {
      gte: start,
      lte: end,
    };
  }

  if (query.dateRange === "thisWeek") {
    const start = new Date(now);
    const day = start.getDay();

    const diff = start.getDate() - day;
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return {
      gte: start,
      lte: end,
    };
  }

  if (query.dateRange === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

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
      const fromDate = new Date(query.fromDate);
      fromDate.setHours(0, 0, 0, 0);
      dateFilter.gte = fromDate;
    }

    if (query.toDate) {
      const toDate = new Date(query.toDate);
      toDate.setHours(23, 59, 59, 999);
      dateFilter.lte = toDate;
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