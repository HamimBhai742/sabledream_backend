import { DailyReflection } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import { BooksService } from "../books/books.service";

// Parse CSV text respecting quotes, double-quotes, commas, and linebreaks inside cells
function parseCSV(csvText: string): string[][] {
  const result: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',') {
      if (insideQuotes) {
        currentField += char;
      } else {
        currentRow.push(currentField);
        currentField = "";
      }
    } else if (char === '\n' || char === '\r') {
      if (insideQuotes) {
        currentField += char;
      } else {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip \n
        }
        currentRow.push(currentField);
        result.push(currentRow);
        currentRow = [];
        currentField = "";
      }
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    result.push(currentRow);
  }

  return result;
}

// Maps a raw CSV header label to its corresponding schema field name
function normalizeHeader(header: string): string | null {
  const norm = header.toLowerCase().replace(/[\s_\-\.\?]+/g, "");

  if (norm === "date") return "date";
  if (norm === "reflection") return "reflection";
  if (norm === "affirmation") return "affirmation";
  if (norm === "journalprompt1" || norm === "journalpromptone" || norm === "prompt1" || norm === "journalprompt") return "journalPrompt1";
  if (norm === "journalprompt2" || norm === "journalprompttwo" || norm === "prompt2") return "journalPrompt2";

  if (norm.includes("book1") || norm.includes("bok1")) {
    if (norm.includes("title")) return "book1Title";
    if (norm.includes("author")) return "book1Author";
    if (norm.includes("idnumber") || norm.includes("volumeid") || norm.includes("googlebooksid")) return "book1VolumeId";
    if (norm.includes("link") || norm.includes("googlebookslink")) return "book1Link";
    if (norm.includes("matchstatus") || norm.includes("matchstat")) return "book1MatchStatus";
  }

  if (norm.includes("book2") || norm.includes("bok2")) {
    if (norm.includes("title")) return "book2Title";
    if (norm.includes("author")) return "book2Author";
    if (norm.includes("idnumber") || norm.includes("volumeid") || norm.includes("googlebooksid")) return "book2VolumeId";
    if (norm.includes("link") || norm.includes("googlebookslink")) return "book2Link";
    if (norm.includes("matchstatus") || norm.includes("matchstat")) return "book2MatchStatus";
  }

  return null;
}

// Normalizes date string into MM/DD/YYYY format
function normalizeDateString(dateStr: string): string {
  const parts = dateStr.trim().split(/[\/\-]/);
  if (parts.length === 3) {
    let month = "";
    let day = "";
    let year = "";

    // Check if it is YYYY-MM-DD format
    if (parts[0].length === 4) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else {
      // MM/DD/YYYY format
      month = parts[0];
      day = parts[1];
      year = parts[2];
    }

    const cleanMonth = month.padStart(2, "0");
    const cleanDay = day.padStart(2, "0");
    const cleanYear = year.length === 2 ? `20${year}` : year;

    return `${cleanMonth}/${cleanDay}/${cleanYear}`;
  }
  return dateStr;
}

const importCSV = async (csvBuffer: Buffer) => {
  const csvText = csvBuffer.toString("utf-8");
  const parsedRows = parseCSV(csvText);

  if (parsedRows.length === 0) {
    return {
      successCount: 0,
      failCount: 0,
      errors: ["CSV file is empty"],
    };
  }

  const headers = parsedRows[0].map(h => h.trim());

  let successCount = 0;
  let failCount = 0;
  const errors: string[] = [];
  const upsertedDates: string[] = [];

  for (let idx = 1; idx < parsedRows.length; idx++) {
    const values = parsedRows[idx];
    // Skip empty lines
    if (values.length === 1 && values[0].trim() === "") continue;

    const rawRow: Record<string, string> = {};
    headers.forEach((header, index) => {
      rawRow[header] = values[index] !== undefined ? values[index].trim() : "";
    });

    const normalizedRow: Record<string, any> = {};

    // Map headers to schema fields
    Object.entries(rawRow).forEach(([key, val]) => {
      const mappedField = normalizeHeader(key);
      if (mappedField) {
        normalizedRow[mappedField] = val;
      }
    });

    // Validate required fields
    if (!normalizedRow.date) {
      errors.push(`Row ${idx + 1}: Date is required`);
      failCount++;
      continue;
    }
    if (!normalizedRow.reflection) {
      errors.push(`Row ${idx + 1} (${normalizedRow.date}): Reflection is required`);
      failCount++;
      continue;
    }
    if (!normalizedRow.affirmation) {
      errors.push(`Row ${idx + 1} (${normalizedRow.date}): Affirmation is required`);
      failCount++;
      continue;
    }
    if (!normalizedRow.journalPrompt1) {
      errors.push(`Row ${idx + 1} (${normalizedRow.date}): Journal Prompt 1 is required`);
      failCount++;
      continue;
    }
    if (!normalizedRow.journalPrompt2) {
      errors.push(`Row ${idx + 1} (${normalizedRow.date}): Journal Prompt 2 is required`);
      failCount++;
      continue;
    }

    // Normalize date format
    normalizedRow.date = normalizeDateString(normalizedRow.date);

    try {
      await prisma.dailyReflection.upsert({
        where: { date: normalizedRow.date },
        update: {
          reflection: normalizedRow.reflection,
          affirmation: normalizedRow.affirmation,
          journalPrompt1: normalizedRow.journalPrompt1,
          journalPrompt2: normalizedRow.journalPrompt2,
          book1Title: normalizedRow.book1Title || null,
          book1Author: normalizedRow.book1Author || null,
          book1VolumeId: normalizedRow.book1VolumeId || null,
          book1Link: normalizedRow.book1Link || null,
          book1MatchStatus: normalizedRow.book1MatchStatus || null,
          book2Title: normalizedRow.book2Title || null,
          book2Author: normalizedRow.book2Author || null,
          book2VolumeId: normalizedRow.book2VolumeId || null,
          book2Link: normalizedRow.book2Link || null,
          book2MatchStatus: normalizedRow.book2MatchStatus || null,
        },
        create: {
          date: normalizedRow.date,
          reflection: normalizedRow.reflection,
          affirmation: normalizedRow.affirmation,
          journalPrompt1: normalizedRow.journalPrompt1,
          journalPrompt2: normalizedRow.journalPrompt2,
          book1Title: normalizedRow.book1Title || null,
          book1Author: normalizedRow.book1Author || null,
          book1VolumeId: normalizedRow.book1VolumeId || null,
          book1Link: normalizedRow.book1Link || null,
          book1MatchStatus: normalizedRow.book1MatchStatus || null,
          book2Title: normalizedRow.book2Title || null,
          book2Author: normalizedRow.book2Author || null,
          book2VolumeId: normalizedRow.book2VolumeId || null,
          book2Link: normalizedRow.book2Link || null,
          book2MatchStatus: normalizedRow.book2MatchStatus || null,
        },
      });
      successCount++;
      upsertedDates.push(normalizedRow.date);
    } catch (err: any) {
      errors.push(`Row ${idx + 1} (${normalizedRow.date}): Database error - ${err.message}`);
      failCount++;
    }
  }

  // Sync database: delete reflections whose dates are no longer present in the uploaded CSV
  if (successCount > 0) {
    try {
      await prisma.dailyReflection.deleteMany({
        where: {
          date: {
            notIn: upsertedDates,
          },
        },
      });
    } catch (err: any) {
      errors.push(`Sync Error: Failed to clean up removed rows from database - ${err.message}`);
    }
  }

  return {
    successCount,
    failCount,
    errors,
  };
};

const getAllDailyReflections = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  bookStatus?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  const andConditions: any[] = [];

  if (query.search) {
    const searchVal = query.search;
    andConditions.push({
      OR: [
        { date: { contains: searchVal, mode: "insensitive" } },
        { reflection: { contains: searchVal, mode: "insensitive" } },
        { affirmation: { contains: searchVal, mode: "insensitive" } },
        { journalPrompt1: { contains: searchVal, mode: "insensitive" } },
        { journalPrompt2: { contains: searchVal, mode: "insensitive" } },
        { book1Title: { contains: searchVal, mode: "insensitive" } },
        { book1Author: { contains: searchVal, mode: "insensitive" } },
        { book2Title: { contains: searchVal, mode: "insensitive" } },
        { book2Author: { contains: searchVal, mode: "insensitive" } },
      ],
    });
  }

  if (query.bookStatus) {
    if (query.bookStatus === "notfound") {
      andConditions.push({
        OR: [
          { book1MatchStatus: null },
          { book2MatchStatus: null },
        ],
      });
    } else if (query.bookStatus === "found") {
      andConditions.push({ book1MatchStatus: { not: null } });
      andConditions.push({ book2MatchStatus: { not: null } });
    }
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const [data, total] = await Promise.all([
    prisma.dailyReflection.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.dailyReflection.count({ where }),
  ]);

  const totalPage = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};

const getDailyReflectionByDate = async (dateStr?: string) => {
  let targetDate = "";

  if (dateStr) {
    targetDate = normalizeDateString(dateStr);
  } else {
    // Default to today
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    targetDate = `${month}/${day}/${year}`;
  }

  const reflection = await prisma.dailyReflection.findUnique({
    where: { date: targetDate },
  });

  if (!reflection) {
    return null;
  }

  let book1Details = null;
  let book2Details = null;

  if (reflection.book1VolumeId) {
    try {
      book1Details = await BooksService.getBookById(reflection.book1VolumeId);
    } catch (error) {
      console.error(`Failed to fetch book1 details for volume ${reflection.book1VolumeId}:`, error);
    }
  }

  if (reflection.book2VolumeId) {
    try {
      book2Details = await BooksService.getBookById(reflection.book2VolumeId);
    } catch (error) {
      console.error(`Failed to fetch book2 details for volume ${reflection.book2VolumeId}:`, error);
    }
  }

  return {
    ...reflection,
    book1Details,
    book2Details,
  };
};
const deleteDailyReflection = async (id: string) => {
  return await prisma.dailyReflection.delete({
    where: { id },
  });
};

const updateDailyReflection = async (id: string, payload: Partial<DailyReflection>) => {
  const existingReflection = await prisma.dailyReflection.findUnique({
    where: { id },
  });

  if (!existingReflection) {
    throw new AppError(httpStatus.NOT_FOUND, "Daily reflection not found");
  }

  if (payload.date) {
    payload.date = normalizeDateString(payload.date);

    const duplicate = await prisma.dailyReflection.findUnique({
      where: { date: payload.date },
    });

    if (duplicate && duplicate.id !== id) {
      throw new AppError(
        httpStatus.CONFLICT,
        "A daily reflection already exists for this date"
      );
    }
  }

  const result = await prisma.dailyReflection.update({
    where: { id },
    data: payload,
  });

  return result;
};

export const DailyReflectionService = {
  importCSV,
  getAllDailyReflections,
  getDailyReflectionByDate,
  deleteDailyReflection,
  updateDailyReflection,
};

