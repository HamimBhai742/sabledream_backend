import { z } from "zod";

const createAffirmationSchema = z.object({
  text: z.string().min(1, "Text is required"),
  category: z.string().min(1, "Category is required"),
  goal: z.string().min(1, "Goal is required"),
  mood: z.string().min(1, "Mood is required"),
  timeOfDay: z.string().min(1, "Time of day is required"),
  subStatements: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const updateAffirmationSchema = z
  .object({
    text: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    goal: z.string().min(1).optional(),
    mood: z.string().min(1).optional(),
    timeOfDay: z.string().min(1).optional(),
    subStatements: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    { message: "At least one field is required" },
  );

export const AffirmationValidation = {
  createAffirmationSchema,
  updateAffirmationSchema,
};

