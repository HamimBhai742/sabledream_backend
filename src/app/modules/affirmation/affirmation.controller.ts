import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsyncFn from "../../utils/catchAsyncFn";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../error/AppError";
import { AffirmationService } from "./affirmation.service";

const getAllAffirmations = catchAsyncFn(async (req: Request, res: Response) => {
  const { category, goal, mood, timeOfDay, search } = req.query;

  const result = await AffirmationService.getAllAffirmations({
    category: category as string,
    goal: goal as string,
    mood: mood as string,
    timeOfDay: timeOfDay as string,
    search: search as string,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Affirmations retrieved successfully",
    data: result,
  });
});

const getTodayAffirmation = catchAsyncFn(async (req: Request, res: Response) => {
  const result = await AffirmationService.getTodayAffirmation();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Today's affirmation retrieved successfully",
    data: result,
  });
});

const saveAffirmation = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await AffirmationService.saveAffirmation(userId, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const unsaveAffirmation = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await AffirmationService.unsaveAffirmation(userId, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const getSavedAffirmations = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { category, goal, mood, timeOfDay } = req.query;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await AffirmationService.getSavedAffirmations(userId, {
    category: category as string,
    goal: goal as string,
    mood: mood as string,
    timeOfDay: timeOfDay as string,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Saved reflections and affirmations retrieved successfully",
    data: result,
  });
});

const createAffirmation = catchAsyncFn(async (req: Request, res: Response) => {
  const result = await AffirmationService.createAffirmation(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Affirmation created successfully",
    data: result,
  });
});

const getAffirmationById = catchAsyncFn(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AffirmationService.getAffirmationById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Affirmation details retrieved successfully",
    data: result,
  });
});

const updateAffirmation = catchAsyncFn(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AffirmationService.updateAffirmation(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Affirmation updated successfully",
    data: result,
  });
});

const deleteAffirmation = catchAsyncFn(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AffirmationService.deleteAffirmation(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Affirmation deleted successfully",
    data: null,
  });
});

export const AffirmationController = {
  getAllAffirmations,
  getTodayAffirmation,
  saveAffirmation,
  unsaveAffirmation,
  getSavedAffirmations,
  createAffirmation,
  getAffirmationById,
  updateAffirmation,
  deleteAffirmation,
};
