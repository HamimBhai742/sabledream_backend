import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsyncFn from "../../utils/catchAsyncFn";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../error/AppError";
import { UserService } from "./user.service";

const updateProfile = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await UserService.updateProfile(userId, req.body, req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const changePassword = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  // Get IP address (supporting proxy headers)
  const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip || "Unknown IP";

  // Get raw user-agent header
  const userAgent = req.headers["user-agent"];

  const result = await UserService.changePassword(userId, req.body, {
    ipAddress,
    userAgent,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const downloadMyData = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await UserService.downloadMyData(userId);

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", "attachment; filename=sabledream-my-data.json");
  res.status(httpStatus.OK).send(JSON.stringify(result, null, 2));
});

const deleteAccount = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  // Get IP address (supporting proxy headers)
  const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip || "Unknown IP";

  // Get raw user-agent header
  const userAgent = req.headers["user-agent"];

  const result = await UserService.deleteAccount(userId, {
    ipAddress,
    userAgent,
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Account and all associated data deleted successfully",
    data: result,
  });
});

const updatePrivacySettings = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await UserService.updatePrivacySettings(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Privacy settings updated successfully",
    data: result,
  });
});

const updateFcmToken = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { fcmToken } = req.body;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  if (!fcmToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "FCM Token is required");
  }

  const result = await UserService.updateFcmToken(userId, fcmToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "FCM token updated successfully",
    data: result,
  });
});

export const UserController = {
  updateProfile,
  changePassword,
  downloadMyData,
  deleteAccount,
  updatePrivacySettings,
  updateFcmToken,
};

