export type TAdminUserListQuery = {
  page?: string;
  limit?: string;
  search?: string;
  status?: "active" | "inactive" | "blocked" | string;
  role?: "user" | "admin" | string;
  provider?: "EMAIL" | "GOOGLE" | "APPLE" | string;
  sortBy?: "createdAt" | "updatedAt" | "name" | "email" | string;
  sortOrder?: "asc" | "desc" | string;
};

export type TAdminManifestationListQuery = {
  page?: string;
  limit?: string;
  search?: string;
  userId?: string;
  sortBy?: "createdAt" | "updatedAt" | "name" | string;
  sortOrder?: "asc" | "desc" | string;
};

export type TAdminMoodAnalyticsQuery = {
  days?: string;
};
