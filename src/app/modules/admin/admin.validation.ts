import { z } from "zod";

const updateUserStatusSchema = z.object({
  status: z.enum(["active", "inactive", "blocked"]),
});

const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export const AdminValidation = {
  updateUserStatusSchema,
  updateUserRoleSchema,
};

