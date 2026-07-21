import { Router } from "express";
import checkAuth from "../../middleware/checkAuth";
import validateRequest from "../../middleware/validateRequest";
import { EventLogController } from "./event-log.controller";
import { EventLogValidation } from "./event-log.validation";

const router = Router();

router.post(
  "/",
  checkAuth("user", "admin"),
  validateRequest(EventLogValidation.createEventLogSchema),
  EventLogController.createEventLogs
);

export const EventLogRoutes = router;
