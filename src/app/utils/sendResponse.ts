import { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
  };
};

const sendResponse = <T>(res: Response, payload: TResponse<T>) => {
  const responseData: TResponse<T> = {
    statusCode: payload.statusCode,
    success: payload.success,
    message: payload.message,
  };

  if (payload.meta) {
    responseData.meta = payload.meta;
  }

  if (payload.data !== undefined) {
    responseData.data = payload.data;
  }

  return res.status(payload.statusCode).json(responseData);
};

export default sendResponse;