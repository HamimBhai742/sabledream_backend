import { Router } from "express";
import { ReminderController } from "./reminder.controller";
import checkAuth from "../../middleware/checkAuth";

const router = Router();

// Retrieve reminder settings for the authenticated user
router.get("/", checkAuth("user", "admin"), ReminderController.getReminderSettings);

// Instant push notification testing endpoint for Postman
router.post("/test", checkAuth("user", "admin"), ReminderController.testNotification);

// Update specific reminder setting by type (journal, mood, affirmation)
router.patch("/:type", checkAuth("user", "admin"), ReminderController.updateReminderSettings);

export const ReminderRoutes = router;
