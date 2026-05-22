"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const router = (0, express_1.Router)();
// Retrieve all notifications for the authenticated user
router.get("/", (0, checkAuth_1.default)("user", "admin"), notification_controller_1.NotificationController.getUserNotifications);
// Mark all notifications as read for the authenticated user
router.patch("/read-all", (0, checkAuth_1.default)("user", "admin"), notification_controller_1.NotificationController.markAllNotificationsAsRead);
// Mark a specific notification as read
router.patch("/:id/read", (0, checkAuth_1.default)("user", "admin"), notification_controller_1.NotificationController.markNotificationAsRead);
// Delete a specific notification
router.delete("/:id", (0, checkAuth_1.default)("user", "admin"), notification_controller_1.NotificationController.deleteNotification);
exports.NotificationRoutes = router;
