import { Router } from 'express';
import { MoodController } from './mood.controller';
import checkAuth from '../../middleware/checkAuth';
import validateRequest from '../../middleware/validateRequest';
import { MoodValidation } from './mood.validation';

const router = Router();

router.post(
  '/create',
  checkAuth('user', 'admin'),
  validateRequest(MoodValidation.moodValidationSchema),
  MoodController.createOrUpdateMood
);

router.get(
  '/my-mood',
  checkAuth('user', 'admin'),
  MoodController.getMoodByDate
);

router.get(
  '/calendar',
  checkAuth('user', 'admin'),
  MoodController.getMoodsByDateRange
);

router.get(
  '/history',
  checkAuth('user', 'admin'),
  MoodController.getMoodHistory
);

export const MoodRoutes = router;
