import { z } from "zod";

export const createJournalSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  prompt: z.string().max(300).optional(),
  content: z.string().max(10000).optional(),

  mood: z
    .enum(["HAPPY", "SAD", "CALM", "GRATEFUL", "ANXIOUS", "EXCITED", "NEUTRAL"])
    .optional(),

  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),

  categoryIds: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
});

export const updateJournalSchema = createJournalSchema.partial().extend({
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
});