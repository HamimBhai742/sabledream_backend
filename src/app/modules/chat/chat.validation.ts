import { z } from "zod";

export const chatMessageSchema = z.object({
  user_id: z.string().min(1).optional(),
  message: z.string().min(1, "message is required").max(4000),
});

export const updateTokenLimitSchema = z.object({
  type: z.enum(["increase", "decrease"]),
  amount: z.number().int().positive("Amount must be greater than 0"),
});

export const updateGlobalCapSchema = z.object({
  globalTokenCap: z.number().int().nonnegative(),
});

export const ChatValidation = {
  chatMessageSchema,
  updateTokenLimitSchema,
  updateGlobalCapSchema,
};

