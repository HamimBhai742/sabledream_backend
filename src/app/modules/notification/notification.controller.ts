import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsyncFn from "../../utils/catchAsyncFn";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../error/AppError";
import { NotificationService } from "./notification.service";

const getUserNotifications = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const { page, limit } = req.query as { page?: string; limit?: string };
  const result = await NotificationService.getUserNotifications(userId, { page, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const markNotificationAsRead = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params as { id: string };

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await NotificationService.markNotificationAsRead(userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification marked as read successfully",
    data: result,
  });
});

const markAllNotificationsAsRead = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await NotificationService.markAllNotificationsAsRead(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All notifications marked as read successfully",
    data: result,
  });
});

const deleteNotification = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params as { id: string };

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await NotificationService.deleteNotification(userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification deleted successfully",
    data: result,
  });
});

export const NotificationController = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
