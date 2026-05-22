"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderRoutes = void 0;
const express_1 = require("express");
const reminder_controller_1 = require("./reminder.controller");
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const router = (0, express_1.Router)();
// Retrieve reminder settings for the authenticated user
router.get("/", (0, checkAuth_1.default)("user", "admin"), reminder_controller_1.ReminderController.getReminderSettings);
// Instant push notification testing endpoint for Postman
router.post("/test", (0, checkAuth_1.default)("user", "admin"), reminder_controller_1.ReminderController.testNotification);
// Update specific reminder setting by type (journal, mood, affirmation)
router.patch("/:type", (0, checkAuth_1.default)("user", "admin"), reminder_controller_1.ReminderController.updateReminderSettings);
exports.ReminderRoutes = router;
