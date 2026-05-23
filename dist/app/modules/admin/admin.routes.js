"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const admin_controller_1 = require("./admin.controller");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const admin_validation_1 = require("./admin.validation");
const router = (0, express_1.Router)();
router.use((0, checkAuth_1.default)("admin"));
router.get("/overview", admin_controller_1.AdminController.getOverview);
router.get("/users", admin_controller_1.AdminController.getUsers);
router.get("/users/:userId", admin_controller_1.AdminController.getUserDetails);
router.patch("/users/:userId/status", (0, validateRequest_1.default)(admin_validation_1.AdminValidation.updateUserStatusSchema), admin_controller_1.AdminController.updateUserStatus);
router.patch("/users/:userId/role", (0, validateRequest_1.default)(admin_validation_1.AdminValidation.updateUserRoleSchema), admin_controller_1.AdminController.updateUserRole);
exports.AdminRoutes = router;
