import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import verifyToken, { TAuthUser } from "../utils/verifyToken";
import AppError from "../error/AppError";
import config from "../config";

declare global {
  namespace Express {
    interface Request {
      user?: TAuthUser;
    }
  }
}

const checkAuth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Authorization token is missing"
        );
      }

      const [bearer, token] = authHeader.split(" ");

      if (bearer !== "Bearer" || !token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid authorization token format"
        );
      }

      const decoded = verifyToken(
        token,
        config.jwt_access_secret as string
      );

      if (
        requiredRoles.length &&
        (!decoded.role || !requiredRoles.includes(decoded.role))
      ) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not authorized to access this resource"
        );
      }

      req.user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };

export default checkAuth;