import { z } from "zod";

export const chatMessageSchema = z.object({
  user_id: z.string().min(1).optional(),
  message: z.string().min(1, "message is required").max(4000),
});

export const ChatValidation = {
  chatMessageSchema,
};

