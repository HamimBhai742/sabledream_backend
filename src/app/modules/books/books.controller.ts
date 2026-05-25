import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsyncFn from "../../utils/catchAsyncFn";
import sendResponse from "../../utils/sendResponse";
import { BooksService } from "./books.service";

const getBooks = catchAsyncFn(async (req: Request, res: Response) => {
  const result = await BooksService.getBooks({
    search: req.query.search as string,
    page: req.query.page as string,
    limit: req.query.limit as string,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Books retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getBookById = catchAsyncFn(async (req: Request, res: Response) => {
  const result = await BooksService.getBookById(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book details retrieved successfully",
    data: result,
  });
});

export const BooksController = {
  getBooks,
  getBookById,
};
