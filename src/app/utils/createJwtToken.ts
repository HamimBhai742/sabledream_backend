import jwt, { SignOptions, Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import AppError from "../error/AppError";

export type TJwtPayload = {
  userId: string;
  email: string;
  role?: string;
};

const createToken = (
  payload: TJwtPayload,
  secret: Secret,
  expiresIn:string
): string => {
  if (!secret) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "JWT secret is not configured"
    );
  }

  if (!payload?.userId || !payload?.email) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid JWT payload"
    );
  }

  const token = jwt.sign(payload, secret, {
    expiresIn,
  } as SignOptions);

  return token;
};

export default createToken;