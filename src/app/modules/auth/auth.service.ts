import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { createAuthTokens } from "../../utils/createAuthTokens";
import crypto from "crypto";
import { forgotPasswordTemplate } from "../../utils/emailTemplates/forgetPassword";
import { resetPasswordSuccessTemplate } from "../../utils/emailTemplates/resetPasswordSuccess";
import { verifyFirebaseGoogleToken, verifyFirebaseAppleToken } from "../../utils/firebase.token";
import verifyToken from "../../utils/verifyToken";
import createToken from "../../utils/createJwtToken";
import { welcomeSableDreamTemplate } from "../../utils/emailTemplates/signUpSuccess";
import { generatePermanentUserId, ensurePermanentUserId } from "../../utils/generatePermanentUserId";

const registerUser = async (payload: any) => {
  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    if (!existingUser.password) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Email is already registered via social login. Please log in using Google or Apple.",
      );
    }
    throw new AppError(
      httpStatus.CONFLICT,
      "User with this email already exists",
    );
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  // Generate permanent user ID
  const permanentId = await generatePermanentUserId();

  // Fetch default monthly token limit
  const configRecord = await prisma.appConfig.findUnique({
    where: { key: "default_monthly_token_limit" },
  });
  const defaultLimit = configRecord ? Number(configRecord.value) : 50000;

  // Create the user
  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      permanentId,
      isVerified: true, // Auto-verified based on user request (no OTP needed)
      monthlyTokenLimit: defaultLimit,
    },
  });

  // Generate tokens
  const tokens = createAuthTokens({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  // Remove the password field from the returned user object
  const { password, ...userWithoutPassword } = newUser;

  await welcomeSableDreamTemplate({
    userName: newUser.name,
    email: newUser.email,
    joinedAt: new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  })
  return {
    user: userWithoutPassword,
    ...tokens,
  };
};

const loginUser = async (payload: any) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.password) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Please login with social login",
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid password");
  }

  const tokens = createAuthTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    ...tokens,
  };
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User with this email not found");
  }

  if (!user.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This account uses social login. Password reset is not applicable.",
    );
  }

  // Generate a secure 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP for storing in the database for security
  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // Token expires in 15 minutes
  const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      forgetPasswordToken: hashedOtp,
      forgetPasswordTokenExpires: tokenExpires,
    },
  });

  try {
    const data = {
      userName: user.name,
      email,
      otp,
      requestedAt: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    };

    await forgotPasswordTemplate(data);
  } catch (error) {
    await prisma.user.update({
      where: { email },
      data: {
        forgetPasswordToken: null,
        forgetPasswordTokenExpires: null,
      },
    });
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "There was an error sending the password reset email. Try again later.",
    );
  }

  return { message: "Password reset OTP sent to your email" };
};

const resetPassword = async (payload: any) => {
  const { email, token, otp, newPassword } = payload;
  const code = token || otp;

  if (!code) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Verification code (token or otp) is required",
    );
  }

  const hashedToken = crypto.createHash("sha256").update(code).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      email,
      forgetPasswordToken: hashedToken,
      forgetPasswordTokenExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Verification code is invalid or has expired",
    );
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: {
      password: newHashedPassword,
      forgetPasswordToken: null,
      forgetPasswordTokenExpires: null,
    },
  });
  const data = {
    userName: user.name,
    email,
    resetAt: new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };
  await resetPasswordSuccessTemplate(data);
  return { message: "Password reset successfully" };
};

const verifyOtp = async (payload: any) => {
  const { email, token, otp } = payload;
  const code = token || otp;

  if (!code) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Verification code (token or otp) is required",
    );
  }

  const hashedToken = crypto.createHash("sha256").update(code).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      email,
      forgetPasswordToken: hashedToken,
      forgetPasswordTokenExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Verification code is invalid or has expired",
    );
  }

  return { message: "OTP verified successfully" };
};

const googleLoginService = async (idToken: string) => {
  const payload = await verifyFirebaseGoogleToken(idToken);

  if (!payload || !payload.email) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Email not found in Google Firebase token");
  }

  const { email, name, picture, uid, email_verified } = payload;

  if (email_verified === false) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Google email is not verified");
  }

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { providerId: uid },
        { email: email },
      ],
    },
  });

  if (!user) {
    const permanentId = await generatePermanentUserId();
    const configRecord = await prisma.appConfig.findUnique({
      where: { key: "default_monthly_token_limit" },
    });
    const defaultLimit = configRecord ? Number(configRecord.value) : 50000;

    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0] || "Google User",
        image: picture || null,
        provider: "GOOGLE",
        providerId: uid,
        permanentId,
        isVerified: true,
        monthlyTokenLimit: defaultLimit,
      },
    });

    // Send welcome email to new Google sign-up
    try {
      await welcomeSableDreamTemplate({
        userName: user.name,
        email: user.email,
        joinedAt: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      });
    } catch (emailError) {
      console.error("[Email] Failed to send welcome email to new Google user:", emailError);
    }
  } else {
    const permanentId = await ensurePermanentUserId(user.id, user.permanentId);
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        provider: user.provider || "GOOGLE",
        providerId: user.providerId || uid,
        image: user.image || picture || null,
        permanentId,
        isVerified: true,
      },
    });
  }

  const tokens = createAuthTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    ...tokens,
  };
};

const appleLoginService = async (
  idToken: string,
  fullName?: string | { givenName?: string; familyName?: string },
  userEmail?: string
) => {
  const payload = await verifyFirebaseAppleToken(idToken);

  if (!payload || !payload.uid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Apple login token");
  }

  const providerId = payload.uid;
  const email = payload.email || userEmail;

  // Format full name if provided as an object or string
  let formattedName = "";
  if (typeof fullName === "string") {
    formattedName = fullName.trim();
  } else if (fullName && typeof fullName === "object") {
    formattedName = `${fullName.givenName || ""} ${fullName.familyName || ""}`.trim();
  }

  // Find user by providerId first, or by email if available
  let user = await prisma.user.findFirst({
    where: email
      ? { OR: [{ providerId }, { email }] }
      : { providerId },
  });

  if (!user) {
    if (!email) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Email is required for new Apple account registration"
      );
    }

    const permanentId = await generatePermanentUserId();
    const configRecord = await prisma.appConfig.findUnique({
      where: { key: "default_monthly_token_limit" },
    });
    const defaultLimit = configRecord ? Number(configRecord.value) : 50000;

    user = await prisma.user.create({
      data: {
        email,
        name: formattedName || payload.name || email.split("@")[0] || "Apple User",
        provider: "APPLE",
        providerId,
        permanentId,
        isVerified: true,
        monthlyTokenLimit: defaultLimit,
      },
    });

    // Send welcome email to new Apple sign-up
    try {
      await welcomeSableDreamTemplate({
        userName: user.name,
        email: user.email,
        joinedAt: new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      });
    } catch (emailError) {
      console.error("[Email] Failed to send welcome email to new Apple user:", emailError);
    }
  } else {
    const permanentId = await ensurePermanentUserId(user.id, user.permanentId);
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: formattedName && user.name === "Apple User" ? formattedName : user.name,
        provider: user.provider || "APPLE",
        providerId: user.providerId || providerId,
        permanentId,
        isVerified: true,
      },
    });
  }

  const tokens = createAuthTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    ...tokens,
  };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const permanentId = await ensurePermanentUserId(user.id, user.permanentId);
  user.permanentId = permanentId;

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

const refreshTokenService = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is missing");
  }

  // Verify the refresh token
  const decoded = verifyToken(
    refreshToken,
    process.env.JWT_REFRESH_SECRET as string
  );

  // Fetch the user
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.status !== "active") {
    throw new AppError(httpStatus.FORBIDDEN, "User account is suspended");
  }

  // Generate a new access token
  const accessToken = createToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET as string,
    process.env.JWT_ACCESS_EXPIRES_IN || "15m"
  );

  return {
    accessToken,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  googleLoginService,
  appleLoginService,
  getMe,
  refreshTokenService,
};
