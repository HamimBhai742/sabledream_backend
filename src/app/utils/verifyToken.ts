import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import AppError from "../error/AppError";

export interface TAuthUser extends JwtPayload {
  userId: string;
  email: string;
  role?: string;
}

const verifyToken = (token: string, secret: string): TAuthUser => {
  try {
    const decoded = jwt.verify(token, secret) as TAuthUser;

    if (!decoded?.userId || !decoded?.email) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Token has expired");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    throw error;
  }
};

export default verifyToken;
