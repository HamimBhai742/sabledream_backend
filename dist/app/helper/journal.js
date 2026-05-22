"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildJournalWhereFilter = exports.getJournalOrderBy = exports.getPagination = void 0;
const getPagination = (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    return {
        page,
        limit,
        skip,
    };
};
exports.getPagination = getPagination;
const parseCommaSeparatedValues = (value) => {
    if (!value)
        return [];
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};
const getDateRangeFilter = (query) => {
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
        const dateFilter = {};
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
const getJournalOrderBy = (sortBy) => {
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
exports.getJournalOrderBy = getJournalOrderBy;
const buildJournalWhereFilter = (query, userId) => {
    const where = {};
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
            in: moods,
        };
    }
    if (query.status) {
        where.status = query.status;
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
exports.buildJournalWhereFilter = buildJournalWhereFilter;
