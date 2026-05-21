import { prisma } from "../../lib/prisma";
import AppError from "../../error/AppError";
import httpStatus from "http-status";

const getUserNotifications = async (
  userId: string,
  query: { page?: string; limit?: string }
) => {
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({
      where: { userId },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
    data: notifications,
  };
};

const markNotificationAsRead = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
  }

  if (notification.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Access forbidden");
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return updatedNotification;
};

const markAllNotificationsAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return {
    message: "All notifications marked as read successfully",
    modifiedCount: result.count,
  };
};

const deleteNotification = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
  }

  if (notification.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Access forbidden");
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return { message: "Notification deleted successfully" };
};

export const NotificationService = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
