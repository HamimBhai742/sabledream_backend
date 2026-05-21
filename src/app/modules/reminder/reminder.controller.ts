import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsyncFn from "../../utils/catchAsyncFn";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../error/AppError";
import { ReminderService } from "./reminder.service";
import { prisma } from "../../lib/prisma";
import { sendPushNotification } from "../../utils/sendNotification";

const getReminderSettings = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await ReminderService.getReminderSettings(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reminder settings retrieved successfully",
    data: result,
  });
});

const updateReminderSettings = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { type } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const typeStr = type as string;
  const result = await ReminderService.updateReminderSettings(userId, typeStr, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${typeStr.charAt(0).toUpperCase() + typeStr.slice(1)} reminder settings updated successfully`,
    data: result,
  });
});

const testNotification = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.fcmToken) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "FCM Token is not set for your user account. Please update your profile with an fcmToken first."
    );
  }

  const { title, body } = req.body;
  const result = await sendPushNotification(
    user.fcmToken,
    title || "Test Push Notification 🔔",
    body || "Congratulations! Your Sable Dreams push notification system is working perfectly!",
    undefined,
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Test push notification triggered successfully",
    data: result,
  });
});

export const ReminderController = {
  getReminderSettings,
  updateReminderSettings,
  testNotification,
};
