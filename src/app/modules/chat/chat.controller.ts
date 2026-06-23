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
  const { page, limit, sortBy, sortOrder, month } = req.query as {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    month?: string;
  };
  const { data, meta } = await ChatService.getAllUsersUsage({ page, limit, sortBy, sortOrder, month });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users' chat usage retrieved successfully",
    data,
    meta,
  });
});

const updateUserTokenLimit = catchAsyncFn(async (req: Request, res: Response) => {
  const adminId = req.user?.userId;
  const adminEmail = req.user?.email || "admin@sabledream.com";
  const { userId } = req.params;
  const { monthlyTokenLimit } = req.body;

  if (!adminId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await ChatService.updateUserTokenLimit(adminId, adminEmail, userId as string, monthlyTokenLimit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User monthly token limit updated successfully",
    data: result,
  });
});

const getGlobalTokenCap = catchAsyncFn(async (req: Request, res: Response) => {
  const result = await ChatService.getGlobalTokenCap();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Global monthly token cap retrieved successfully",
    data: result,
  });
});

const updateGlobalTokenCap = catchAsyncFn(async (req: Request, res: Response) => {
  const adminId = req.user?.userId;
  const adminEmail = req.user?.email || "admin@sabledream.com";
  const { globalTokenCap } = req.body;

  if (!adminId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await ChatService.updateGlobalTokenCap(adminId, adminEmail, globalTokenCap);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Global monthly token cap updated successfully",
    data: result,
  });
});

const getAuditLogs = catchAsyncFn(async (req: Request, res: Response) => {
  const result = await ChatService.getAuditLogs();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Limit update audit logs retrieved successfully",
    data: result,
  });
});

const getUserUsageHistory = catchAsyncFn(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await ChatService.getUserUsageHistory(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User monthly usage history retrieved successfully",
    data: result,
  });
});

const exportUsageToCsv = catchAsyncFn(async (req: Request, res: Response) => {
  const { month } = req.query as { month?: string };
  const csvContent = await ChatService.exportUsageToCsv(month);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="chat-usage-${month || "current"}.csv"`);
  res.status(httpStatus.OK).send(csvContent);
});

export const ChatController = {
  sendMessage,
  getHistory,
  deleteHistory,
  getMemory,
  getUsage,
  getAllUsersUsage,
  updateUserTokenLimit,
  getGlobalTokenCap,
  updateGlobalTokenCap,
  getAuditLogs,
  getUserUsageHistory,
  exportUsageToCsv,
};
