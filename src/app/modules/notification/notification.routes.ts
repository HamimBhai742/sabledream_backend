import { Router } from "express";
import { NotificationController } from "./notification.controller";
import checkAuth from "../../middleware/checkAuth";

const router = Router();

// Retrieve all notifications for the authenticated user
router.get("/", checkAuth("user", "admin"), NotificationController.getUserNotifications);

// Mark all notifications as read for the authenticated user
router.patch("/read-all", checkAuth("user", "admin"), NotificationController.markAllNotificationsAsRead);

// Mark a specific notification as read
router.patch("/:id/read", checkAuth("user", "admin"), NotificationController.markNotificationAsRead);

// Delete a specific notification
router.delete("/:id", checkAuth("user", "admin"), NotificationController.deleteNotification);

export const NotificationRoutes = router;
