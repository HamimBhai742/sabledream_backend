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
router.get("/usage/:user_id", checkAuth("admin"), ChatController.getUsage);

export const ChatRoutes = router;

