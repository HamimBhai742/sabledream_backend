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
exports.ReminderController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsyncFn_1 = __importDefault(require("../../utils/catchAsyncFn"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const reminder_service_1 = require("./reminder.service");
const prisma_1 = require("../../lib/prisma");
const sendNotification_1 = require("../../utils/sendNotification");
const getReminderSettings = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = yield reminder_service_1.ReminderService.getReminderSettings(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Reminder settings retrieved successfully",
        data: result,
    });
}));
const updateReminderSettings = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { type } = req.params;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const typeStr = type;
    const result = yield reminder_service_1.ReminderService.updateReminderSettings(userId, typeStr, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `${typeStr.charAt(0).toUpperCase() + typeStr.slice(1)} reminder settings updated successfully`,
        data: result,
    });
}));
const testNotification = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const user = yield prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user || !user.fcmToken) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "FCM Token is not set for your user account. Please update your profile with an fcmToken first.");
    }
    const { title, body } = req.body;
    const result = yield (0, sendNotification_1.sendPushNotification)(user.fcmToken, title || "Test Push Notification 🔔", body || "Congratulations! Your Sable Dreams push notification system is working perfectly!", undefined, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Test push notification triggered successfully",
        data: result,
    });
}));
exports.ReminderController = {
    getReminderSettings,
    updateReminderSettings,
    testNotification,
};
