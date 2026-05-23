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

export type TAdminSubscriptionListQuery = {
  page?: string;
  limit?: string;
  status?: "active" | "trial" | "expired" | string;
  planType?: "free" | "monthly" | "annual" | string;
  search?: string; // user name/email
  sortBy?: "createdAt" | "updatedAt" | "expiresDate" | "purchaseDate" | string;
  sortOrder?: "asc" | "desc" | string;
};

export type TAdminTransactionListQuery = {
  page?: string;
  limit?: string;
  type?: "charge" | "refund" | string;
  status?: string;
  currency?: string;
  userId?: string;
  search?: string; // transactionId/user email/name/phone
  fromDate?: string;
  toDate?: string;
  sortBy?: "createdAt" | "amount" | string;
  sortOrder?: "asc" | "desc" | string;
};
