import AppError from "../error/AppError";
import { prisma } from "../lib/prisma";
import createToken from "./createJwtToken";
import verifyToken from "./verifyToken";
import httpStatus from "http-status"

export const createNewAuthToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.NOT_FOUND, "Refresh token not found");
  }

  const decoded = verifyToken(
    token,
    process.env.JWT_REFRESH_SECRET as string
  );

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND,"User not found")
  }

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