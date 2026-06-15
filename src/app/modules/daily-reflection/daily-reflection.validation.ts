import { z } from "zod";

const updateDailyReflectionSchema = z.object({
  date: z.string().optional(),
  reflection: z.string().optional(),
  affirmation: z.string().optional(),
  journalPrompt1: z.string().optional(),
  journalPrompt2: z.string().optional(),
  book1Title: z.string().nullable().optional(),
  book1Author: z.string().nullable().optional(),
  book1VolumeId: z.string().nullable().optional(),
  book1Link: z.string().nullable().optional(),
  book1MatchStatus: z.string().nullable().optional(),
  book2Title: z.string().nullable().optional(),
  book2Author: z.string().nullable().optional(),
  book2VolumeId: z.string().nullable().optional(),
  book2Link: z.string().nullable().optional(),
  book2MatchStatus: z.string().nullable().optional(),
});

export const DailyReflectionValidation = {
  updateDailyReflectionSchema,
};
