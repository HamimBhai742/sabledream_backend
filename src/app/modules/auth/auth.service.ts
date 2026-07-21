import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { createAuthTokens } from "../../utils/createAuthTokens";
import crypto from "crypto";
import { forgotPasswordTemplate } from "../../utils/emailTemplates/forgetPassword";
import { resetPasswordSuccessTemplate } from "../../utils/emailTemplates/resetPasswordSuccess";
import { OAuth2Client } from "google-auth-library";
import { verifyAppleToken } from "../../utils/apple.token";
import verifyToken from "../../utils/verifyToken";
import createToken from "../../utils/createJwtToken";
import { welcomeSableDreamTemplate } from "../../utils/emailTemplates/signUpSuccess";
import { generatePermanentUserId, ensurePermanentUserId } from "../../utils/generatePermanentUserId";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

  // Create the user
  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      permanentId,
      isVerified: true, // Auto-verified based on user request (no OTP needed)
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

  // Generate a random 64-character hex string as a token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token for storing in the database for security
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token expires in 1 hour
  const tokenExpires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      forgetPasswordToken: hashedToken,
      forgetPasswordTokenExpires: tokenExpires,
    },
  });

  // Construct the reset URL
  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${email}`;

  try {
    const data = {
      userName: user.name,
      email,
      resetUrl,
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

  return { message: "Password reset link sent to your email" };
};

const resetPassword = async (payload: any) => {
  const { email, token, newPassword } = payload;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

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
      "Token is invalid or has expired",
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

const googleLoginService = async (idToken: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: [
      process.env.GOOGLE_ANDROID_CLIENT_ID!,
      process.env.GOOGLE_IOS_CLIENT_ID!,
    ],
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Google token");
  }

  const { email, name, picture, sub, email_verified } = payload;

  if (!email_verified) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Google email is not verified");
  }

  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    const permanentId = await generatePermanentUserId();
    user = await prisma.user.create({
      data: {
        email,
        name: name || "Google User",
        image: picture,
        provider: "GOOGLE",
        providerId: sub,
        permanentId,
        isVerified: true,
      },
    });
  } else {
    const permanentId = await ensurePermanentUserId(user.id, user.permanentId);
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        provider: user.provider || "GOOGLE",
        providerId: user.providerId || sub,
        image: user.image || picture,
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

const appleLoginService = async (idToken: string, fullName?: string) => {
  const payload = await verifyAppleToken(idToken);

  if (!payload || !payload.email || !payload.sub) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Apple login");
  }

  const email = payload.email;
  const providerId = payload.sub;

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const permanentId = await generatePermanentUserId();
    user = await prisma.user.create({
      data: {
        email,
        name: fullName || payload.name || "Apple User",
        provider: "APPLE",
        providerId,
        permanentId,
        isVerified: true,
      },
    });
  } else {
    const permanentId = await ensurePermanentUserId(user.id, user.permanentId);
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
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
  resetPassword,
  googleLoginService,
  appleLoginService,
  getMe,
  refreshTokenService,
};
