import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsyncFn from "../../utils/catchAsyncFn";
import sendResponse from "../../utils/sendResponse";
import { AdminService } from "./admin.service";
import AppError from "../../error/AppError";
import { TJournalQuery } from "../../interface/journal.interface";

type AuthRequest = Request & {
  user?: {
    userId: string;
    email?: string;
    role?: string;
  };
};

const getOverview = catchAsyncFn(async (req: Request, res: Response) => {
  const daysParam = req.query.days;
  const days = typeof daysParam === "string" ? Number(daysParam) : 30;

  const result = await AdminService.getOverview(days);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin overview retrieved successfully",
    data: result,
  });
});

const getUsers = catchAsyncFn(async (req: Request, res: Response) => {
  const result = await AdminService.getUsers(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data as any,
  });
});

const getUserDetails = catchAsyncFn(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const result = await AdminService.getUserDetails(userId as string);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User details retrieved successfully",
    data: result as any,
  });
});

const updateUserStatus = catchAsyncFn(async (req: AuthRequest, res: Response) => {
  const adminUserId = req.user?.userId;
  const { userId } = req.params;

  if (!adminUserId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await AdminService.updateUserStatus(
    adminUserId,
    userId as string,
    req.body.status,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const updateUserRole = catchAsyncFn(async (req: AuthRequest, res: Response) => {
  const adminUserId = req.user?.userId;
  const { userId } = req.params;

  if (!adminUserId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await AdminService.updateUserRole(
    adminUserId,
    userId as string,
    req.body.role,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User role updated successfully",
    data: result,
  });
});

const deleteUser = catchAsyncFn(async (req: AuthRequest, res: Response) => {
  const adminUserId = req.user?.userId;
  const { userId } = req.params;

  if (!adminUserId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  await AdminService.deleteUser(adminUserId, userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});

const deleteJournal = catchAsyncFn(async (req: Request, res: Response) => {
  const { journalId } = req.params;

  await AdminService.deleteJournal(journalId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Journal deleted successfully",
    data: null,
  });
});

const deleteManifestation = catchAsyncFn(async (req: Request, res: Response) => {
  const { manifestationId } = req.params;

  await AdminService.deleteManifestation(manifestationId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Manifestation deleted successfully",
    data: null,
  });
});

export const AdminController = {
  getOverview,
  getUsers,
  getUserDetails,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  deleteJournal,
  deleteManifestation,
  getAllJournals: catchAsyncFn(async (req: Request, res: Response) => {
    const result = await AdminService.getAllJournals(req.query as TJournalQuery);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All journals retrieved successfully",
      meta: (result as any).meta,
      data: (result as any).data,
    });
  }),

  getAllManifestations: catchAsyncFn(async (req: Request, res: Response) => {
    const result = await AdminService.getManifestations(req.query as any);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All manifestations retrieved successfully",
      meta: result.meta as any,
      data: result.data as any,
    });
  }),

  getMoodAnalytics: catchAsyncFn(async (req: Request, res: Response) => {
    const daysParam = req.query.days;
    const days = typeof daysParam === "string" ? Number(daysParam) : 30;

    const result = await AdminService.getMoodAnalytics(days);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Mood analytics retrieved successfully",
      data: result as any,
    });
  }),

  getActiveSubscriptions: catchAsyncFn(async (req: Request, res: Response) => {
    const result = await AdminService.getActiveSubscriptions(req.query as any);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Active subscriptions retrieved successfully",
      meta: result.meta as any,
      data: result.data as any,
    });
  }),

  getTransactions: catchAsyncFn(async (req: Request, res: Response) => {
    const result = await AdminService.getTransactions(req.query as any);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transactions retrieved successfully",
      meta: result.meta as any,
      data: result.data as any,
    });
  }),

  getSubscriptionSummary: catchAsyncFn(async (_req: Request, res: Response) => {
    const result = await AdminService.getSubscriptionSummary();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Subscription summary retrieved successfully",
      data: result as any,
    });
  }),

  getUserActivityMetrics: catchAsyncFn(async (req: Request, res: Response) => {
    const monthYear = req.query.monthYear as string | undefined;
    const result = await AdminService.getUserActivityMetrics(monthYear);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User activity metrics retrieved successfully",
      data: result as any,
    });
  }),

  getEventLogs: catchAsyncFn(async (req: Request, res: Response) => {
    const result = await AdminService.getEventLogs(req.query as any);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Event logs retrieved successfully",
      meta: result.meta as any,
      data: result.data as any,
    });
  }),

  exportEventLogsCSV: catchAsyncFn(async (req: Request, res: Response) => {
    const csvData = await AdminService.exportEventLogsCSV(req.query as any);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="event_logs.csv"');
    res.status(httpStatus.OK).send(csvData);
  }),
};
