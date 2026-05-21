import { ErrorRequestHandler } from 'express';
import config from '../config';
import AppError from '../error/AppError';

// Define standard error response format
type TErrorSources = {
  path: string | number;
  message: string;
}[];

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Default values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong!',
    },
  ];

  // 1. Handle Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  } 
  // 2. Handle Zod Validation Errors (if you add Zod later)
  else if (err?.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    errorSources = err.issues.map((issue: any) => ({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    }));
  }
  // 3. Handle Prisma / Mongoose Duplicate Key Errors
  else if (err?.code === 11000 || err?.code === 'P2002') {
    statusCode = 409;
    message = 'Duplicate Entry';
    errorSources = [
      {
        path: '',
        message: 'A record with this unique field already exists.',
      },
    ];
  }
  // 4. Handle Prisma / Mongoose Cast Errors (Invalid IDs)
  else if (err?.name === 'CastError' || err?.code === 'P2023') {
    statusCode = 400;
    message = 'Invalid ID format';
    errorSources = [
      {
        path: err.path || '',
        message: 'The provided ID is invalid.',
      },
    ];
  }
  // 5. Handle standard JavaScript Error
  else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }

  // Send Final Response
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    // Include stack trace only in development
    stack: config.port === undefined || process.env.NODE_ENV === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
