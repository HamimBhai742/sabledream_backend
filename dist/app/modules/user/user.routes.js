"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const upload_1 = require("../../middleware/upload");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
router.patch("/update-profile", (0, checkAuth_1.default)("user", "admin"), upload_1.upload.single("image"), user_controller_1.UserController.updateProfile);
router.post("/change-password", (0, checkAuth_1.default)("user", "admin"), user_controller_1.UserController.changePassword);
router.get("/download-data", (0, checkAuth_1.default)("user", "admin"), user_controller_1.UserController.downloadMyData);
router.delete("/delete-account", (0, checkAuth_1.default)("user", "admin"), user_controller_1.UserController.deleteAccount);
router.patch("/privacy-settings", (0, checkAuth_1.default)("user", "admin"), user_controller_1.UserController.updatePrivacySettings);
router.patch("/update-fcm-token", (0, checkAuth_1.default)("user", "admin"), user_controller_1.UserController.updateFcmToken);
exports.UserRoutes = router;
