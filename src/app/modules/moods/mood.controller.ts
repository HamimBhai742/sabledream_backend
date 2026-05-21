import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { MoodService } from './moods.services';
import catchAsyncFn from '../../utils/catchAsyncFn';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../error/AppError';

const createOrUpdateMood = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  const result = await MoodService.createOrUpdateMood(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Mood tracked successfully',
    data: result,
  });
});

const getMoodByDate = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { date } = req.query;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  if (!date) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Date is required');
  }

  const result = await MoodService.getMoodByDate(userId, date as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Mood retrieved successfully',
    data: result,
  });
});

const getMoodsByDateRange = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { startDate, endDate, year, month } = req.query;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  let result;
  if (year && month) {
    result = await MoodService.getMoodsByMonth(
      userId,
      parseInt(year as string),
      parseInt(month as string),
    );
  } else if (startDate && endDate) {
    result = await MoodService.getMoodsByDateRange(
      userId,
      startDate as string,
      endDate as string,
    );
  } else {
    // Default to current month if no parameters provided
    const now = new Date();
    result = await MoodService.getMoodsByMonth(
      userId,
      now.getFullYear(),
      now.getMonth() + 1,
    );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Moods retrieved successfully',
    data: result,
  });
});

const getMoodHistory = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  const result = await MoodService.getMoodHistory(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Mood history retrieved successfully',
    data: result,
  });
});

export const MoodController = {
  createOrUpdateMood,
  getMoodByDate,
  getMoodsByDateRange,
  getMoodHistory,
};
