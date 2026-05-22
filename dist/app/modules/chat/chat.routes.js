"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const chat_controller_1 = require("./chat.controller");
const chat_validation_1 = require("./chat.validation");
const router = (0, express_1.Router)();
router.post("/message", (0, checkAuth_1.default)("user", "admin"), (0, validateRequest_1.default)(chat_validation_1.ChatValidation.chatMessageSchema), chat_controller_1.ChatController.sendMessage);
router.get("/history/:user_id", (0, checkAuth_1.default)("user", "admin"), chat_controller_1.ChatController.getHistory);
router.delete("/history/:user_id", (0, checkAuth_1.default)("user", "admin"), chat_controller_1.ChatController.deleteHistory);
router.get("/memory/:user_id", (0, checkAuth_1.default)("user", "admin"), chat_controller_1.ChatController.getMemory);
exports.ChatRoutes = router;
