import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsyncFn from "../../utils/catchAsyncFn";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../error/AppError";
import { DailyReflectionService } from "./daily-reflection.service";

const uploadCSV = catchAsyncFn(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please upload a CSV file");
  }

  const result = await DailyReflectionService.importCSV(req.file.buffer);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "CSV file processed successfully",
    data: result,
  });
});

const getAllDailyReflections = catchAsyncFn(async (req: Request, res: Response) => {
  const { page, limit, search, bookStatus, sortBy, sortOrder } = req.query;

  const result = await DailyReflectionService.getAllDailyReflections({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search as string,
    bookStatus: bookStatus as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Daily reflections retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getDailyReflectionByDate = catchAsyncFn(async (req: Request, res: Response) => {
  const { date } = req.query;

  const result = await DailyReflectionService.getDailyReflectionByDate(date as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result 
      ? "Daily reflection retrieved successfully" 
      : "No daily reflection found for the specified date",
    data: result || null,
  });
});

const deleteDailyReflection = catchAsyncFn(async (req: Request, res: Response) => {
  const { id } = req.params;

  await DailyReflectionService.deleteDailyReflection(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Daily reflection deleted successfully",
    data: null,
  });
});

const updateDailyReflection = catchAsyncFn(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await DailyReflectionService.updateDailyReflection(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Daily reflection updated successfully",
    data: result,
  });
});

export const DailyReflectionController = {
  uploadCSV,
  getAllDailyReflections,
  getDailyReflectionByDate,
  deleteDailyReflection,
  updateDailyReflection,
};
