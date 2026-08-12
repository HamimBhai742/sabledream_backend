import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsyncFn from "../../utils/catchAsyncFn";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import AppError from "../../error/AppError";

const registerUser = catchAsyncFn(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Name, email, and password are required",
    );
  }

  const result = await AuthService.registerUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsyncFn(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Email and password are required",
    );
  }

  const result = await AuthService.loginUser(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const forgotPassword = catchAsyncFn(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email is required");
  }

  const result = await AuthService.forgotPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset email sent",
    data: result,
  });
});

const resendOtp = catchAsyncFn(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email is required");
  }

  const result = await AuthService.forgotPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP resent successfully",
    data: result,
  });
});

const verifyOtp = catchAsyncFn(async (req: Request, res: Response) => {
  const { email, token, otp } = req.body;
  const code = token || otp;

  if (!email || !code) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email and verification code (token or otp) are required");
  }

  const result = await AuthService.verifyOtp(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP verified successfully",
    data: result,
  });
});

const resetPassword = catchAsyncFn(async (req: Request, res: Response) => {
  const { email, token, otp, newPassword } = req.body;
  const code = token || otp;

  if (!email || !code || !newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Email, verification code (token or otp), and new password are required",
    );
  }

  const result = await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successful",
    data: result,
  });
});

const googleLoginController = catchAsyncFn(
  async (req: Request, res: Response) => {
    const { idToken } = req.body;

    if (!idToken) {
      throw new AppError(httpStatus.BAD_REQUEST, "ID token is required");
    }

    const result = await AuthService.googleLoginService(idToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Google login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },
);

const appleLoginController = catchAsyncFn(
  async (req: Request, res: Response) => {
    const { idToken, fullName, email } = req.body;

    if (!idToken) {
      throw new AppError(httpStatus.BAD_REQUEST, "Apple idToken is required");
    }

    const result = await AuthService.appleLoginService(idToken, fullName, email);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Apple login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },
);

const logoutUser = catchAsyncFn(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

const getMe = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await AuthService.getMe(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

const refreshTokenController = catchAsyncFn(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is missing");
  }

  const result = await AuthService.refreshTokenService(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token generated successfully",
    data: result,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  forgotPassword,
  resendOtp,
  verifyOtp,
  resetPassword,
  googleLoginController,
  appleLoginController,
  logoutUser,
  getMe,
  refreshTokenController,
};
