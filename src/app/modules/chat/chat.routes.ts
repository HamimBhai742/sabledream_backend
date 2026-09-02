import { Router } from "express";
import checkAuth from "../../middleware/checkAuth";
import validateRequest from "../../middleware/validateRequest";
import { ChatController } from "./chat.controller";
import { ChatValidation } from "./chat.validation";

const router = Router();

router.post(
  "/message",
  checkAuth("user", "admin"),
  validateRequest(ChatValidation.chatMessageSchema),
  ChatController.sendMessage
);

router.get("/history/:user_id", checkAuth("user", "admin"), ChatController.getHistory);
router.delete("/history/:user_id", checkAuth("user", "admin"), ChatController.deleteHistory);
router.get("/memory/:user_id", checkAuth("user", "admin"), ChatController.getMemory);
router.get("/usage", checkAuth("admin"), ChatController.getAllUsersUsage);
router.post("/usage/reset", checkAuth("admin"), ChatController.resetAllUsersUsage);
router.post("/usage/reset-all", checkAuth("admin"), ChatController.resetAllUsersUsage);
router.post("/usage/:userId/reset", checkAuth("admin"), ChatController.resetUserUsage);
router.post("/usage/reset/:userId", checkAuth("admin"), ChatController.resetUserUsage);
router.get("/export", checkAuth("admin"), ChatController.exportUsageToCsv);
router.get("/usage/:user_id", checkAuth("admin"), ChatController.getUsage);

router.patch(
  "/usage/bulk-limit",
  checkAuth("admin"),
  validateRequest(ChatValidation.updateTokenLimitSchema),
  ChatController.updateAllUsersTokenLimit
);

router.patch(
  "/usage/:userId/limit",
  checkAuth("admin"),
  validateRequest(ChatValidation.updateTokenLimitSchema),
  ChatController.updateUserTokenLimit
);

router.get("/global-cap", checkAuth("admin"), ChatController.getGlobalTokenCap);
router.patch(
  "/global-cap",
  checkAuth("admin"),
  validateRequest(ChatValidation.updateGlobalCapSchema),
  ChatController.updateGlobalTokenCap
);

router.get("/default-limit", checkAuth("admin"), ChatController.getDefaultTokenLimit);
router.patch(
  "/default-limit",
  checkAuth("admin"),
  validateRequest(ChatValidation.updateDefaultLimitSchema),
  ChatController.updateDefaultTokenLimit
);

router.get("/audit-logs", checkAuth("admin"), ChatController.getAuditLogs);
router.get("/usage/:userId/history", checkAuth("admin"), ChatController.getUserUsageHistory);

export const ChatRoutes = router;

