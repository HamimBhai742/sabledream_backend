import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsyncFn from "../../utils/catchAsyncFn";
import sendResponse from "../../utils/sendResponse";
import { PublicDataService } from "./public-data.service";

const getPublicData = catchAsyncFn(async (req: Request, res: Response) => {
  const result = await PublicDataService.getPublicData();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All public data retrieved successfully",
    data: result,
  });
});

export const PublicDataController = {
  getPublicData,
};

