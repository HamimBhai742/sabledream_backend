import { Request, Response } from "express";
import catchAsyncFn from "../../utils/catchAsyncFn";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { EventLogService } from "./event-log.service";
import AppError from "../../error/AppError";

type AuthRequest = Request & {
  user?: {
    userId: string;
    email?: string;
    role?: string;
  };
};

const createEventLogs = catchAsyncFn(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await EventLogService.createEventLogs(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event logs recorded successfully",
    data: result,
  });
});

export const EventLogController = {
  createEventLogs,
};
