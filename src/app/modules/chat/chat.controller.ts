import { Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../../error/AppError";
import catchAsyncFn from "../../utils/catchAsyncFn";
import sendResponse from "../../utils/sendResponse";
import { ChatService } from "./chat.service";

const isTruthy = (value: unknown) => {
  if (Array.isArray(value)) return value.some((v) => v === "1" || v === "true" || v === true);
  return value === "1" || value === "true" || value === true;
};

const resolveUserId = (req: Request, requestedUserId?: string | string[]) => {
  const authUserId = req.user?.userId;
  const role = req.user?.role;
  const normalizedUserId = Array.isArray(requestedUserId) ? requestedUserId[0] : requestedUserId;

  if (!authUserId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  if (normalizedUserId !== undefined && normalizedUserId.trim().length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "user_id is required");
  }

  if (normalizedUserId && normalizedUserId !== authUserId && role !== "admin") {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to access this user's chat");
  }

  return normalizedUserId || authUserId;
};

const sendMessage = catchAsyncFn(async (req: Request, res: Response) => {
  const raw = isTruthy(req.query.raw);
  const userId = resolveUserId(req, req.body.user_id);
  const result = await ChatService.sendMessage(userId, req.body.message);

  if (raw) {
    res.status(httpStatus.OK).json(result);
    return;
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat reply generated successfully",
    data: result,
  });
});

const getHistory = catchAsyncFn(async (req: Request, res: Response) => {
  const raw = isTruthy(req.query.raw);
  const userId = resolveUserId(req, req.params.user_id);
  const result = await ChatService.getHistory(userId);

  if (raw) {
    res.status(httpStatus.OK).json(result);
    return;
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat history retrieved successfully",
    data: result,
  });
});

const deleteHistory = catchAsyncFn(async (req: Request, res: Response) => {
  const raw = isTruthy(req.query.raw);
  const userId = resolveUserId(req, req.params.user_id);
  const result = await ChatService.deleteHistory(userId);

  if (raw) {
    res.status(httpStatus.OK).json(result);
    return;
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat history deleted successfully",
    data: result,
  });
});

const getMemory = catchAsyncFn(async (req: Request, res: Response) => {
  const raw = isTruthy(req.query.raw);
  const userId = resolveUserId(req, req.params.user_id);
  const result = await ChatService.getMemory(userId);

  if (raw) {
    res.status(httpStatus.OK).json(result);
    return;
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat memory retrieved successfully",
    data: result,
  });
});

const getUsage = catchAsyncFn(async (req: Request, res: Response) => {
  const raw = isTruthy(req.query.raw);
  const userId = resolveUserId(req, req.params.user_id);
  const result = await ChatService.getUsage(userId);

  if (raw) {
    res.status(httpStatus.OK).json(result);
    return;
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat usage retrieved successfully",
    data: result,
  });
});

const getAllUsersUsage = catchAsyncFn(async (req: Request, res: Response) => {
  const result = await ChatService.getAllUsersUsage();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users' chat usage retrieved successfully",
    data: result,
  });
});

export const ChatController = {
  sendMessage,
  getHistory,
  deleteHistory,
  getMemory,
  getUsage,
  getAllUsersUsage,
};
