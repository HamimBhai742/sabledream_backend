import { Request, Response } from "express";
import httpStatus from "http-status";
import { JournalService } from "./journal.service";

import catchAsyncFn from "../../utils/catchAsyncFn";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../error/AppError";
import { TJournalQuery } from "../../interface/journal.interface";

type AuthRequest = Request & {
  user?: {
    userId: string;
    email?: string;
    role?: string;
  };
};

const createJournal = catchAsyncFn(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }
  console.log(req.body, req.file);
  const result = await JournalService.createJournal(userId, req.body, req.file);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Journal created successfully",
    data: result,
  });
});

const getMyJournals = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await JournalService.getMyJournals(
    userId,
    req.query as TJournalQuery,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My journals retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllJournals = catchAsyncFn(async (req: Request, res: Response) => {
  const result = await JournalService.getAllJournals(
    req.query as TJournalQuery,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All journals retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getJournalById = catchAsyncFn(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { journalId } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await JournalService.getJournalById(
    userId,
    journalId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Journal retrieved successfully",
    data: result,
  });
});

const updateJournal = catchAsyncFn(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { journalId } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await JournalService.updateJournal(
    userId,
    journalId as string,
    req.body,
    req.file,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Journal updated successfully",
    data: result,
  });
});

const deleteJournal = catchAsyncFn(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { journalId } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  await JournalService.deleteJournal(userId, journalId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Journal deleted successfully",
    data: null,
  });
});

const toggleFavorite = catchAsyncFn(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { journalId } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await JournalService.toggleFavorite(
    userId,
    journalId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Favorite status updated successfully",
    data: result,
  });
});

const archiveJournal = catchAsyncFn(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { journalId } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await JournalService.archiveJournal(
    userId,
    journalId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Journal archived successfully",
    data: result,
  });
});

const createCategory = catchAsyncFn(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await JournalService.createCategory(userId, req.body.name);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getMyCategories = catchAsyncFn(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const result = await JournalService.getMyCategories(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Categories retrieved successfully",
      data: result,
    });
  },
);

export const JournalController = {
  createJournal,
  getMyJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
  toggleFavorite,
  archiveJournal,
  createCategory,
  getMyCategories,
  getAllJournals,
};
