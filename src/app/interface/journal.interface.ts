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
};