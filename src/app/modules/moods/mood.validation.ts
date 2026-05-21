import { z } from 'zod';

export const moodValidationSchema = z.object({
  energy: z.string({
    error: 'Energy is required',
  }),
  activities: z.array(z.string()).min(1, 'At least one activity is required'),
  date: z.string({
    error: 'Date is required',
  }),
});

export const MoodValidation = {
  moodValidationSchema,
};
