"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = require("../../lib/prisma");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const getUserNotifications = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "10", 10);
    const skip = (page - 1) * limit;
    const [notifications, total] = yield Promise.all([
        prisma_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma_1.prisma.notification.count({
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
});
const markNotificationAsRead = (userId, notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield prisma_1.prisma.notification.findUnique({
        where: { id: notificationId },
    });
    if (!notification) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Notification not found");
    }
    if (notification.userId !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Access forbidden");
    }
    const updatedNotification = yield prisma_1.prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
    return updatedNotification;
});
const markAllNotificationsAsRead = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
    return {
        message: "All notifications marked as read successfully",
        modifiedCount: result.count,
    };
});
const deleteNotification = (userId, notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield prisma_1.prisma.notification.findUnique({
        where: { id: notificationId },
    });
    if (!notification) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Notification not found");
    }
    if (notification.userId !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Access forbidden");
    }
    yield prisma_1.prisma.notification.delete({
        where: { id: notificationId },
    });
    return { message: "Notification deleted successfully" };
});
exports.NotificationService = {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};
