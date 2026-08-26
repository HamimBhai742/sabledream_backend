export type TJournalQuery = {
  page?: string;
  limit?: string;
  search?: string;

  categoryId?: string;
  categoryIds?: string;

  mood?: string;
  moods?: string;

  status?: string;
  isFavorite?: string;
  isArchived?: string;

  fromDate?: string;
  toDate?: string;
  dateRange?: "today" | "thisWeek" | "thisMonth" | "allTime";

  sortBy?: "newest" | "oldest" | "monthHighest";

  // Client should send their IANA device timezone (e.g. "Asia/Dhaka", "America/New_York")
  // This ensures date range filters work correctly in the user's local timezone
  timeZone?: string;
};