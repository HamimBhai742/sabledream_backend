"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffirmationRoutes = void 0;
const express_1 = require("express");
const affirmation_controller_1 = require("./affirmation.controller");
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const router = (0, express_1.Router)();
// Public / Authenticated Routes
router.get("/today", affirmation_controller_1.AffirmationController.getTodayAffirmation);
router.get("/", affirmation_controller_1.AffirmationController.getAllAffirmations);
// Saved Affirmations (Authenticated)
router.get("/saved", (0, checkAuth_1.default)("user", "admin"), affirmation_controller_1.AffirmationController.getSavedAffirmations);
router.post("/:id/save", (0, checkAuth_1.default)("user", "admin"), affirmation_controller_1.AffirmationController.saveAffirmation);
router.delete("/:id/unsave", (0, checkAuth_1.default)("user", "admin"), affirmation_controller_1.AffirmationController.unsaveAffirmation);
// Admin-only creation
router.post("/", (0, checkAuth_1.default)("admin"), affirmation_controller_1.AffirmationController.createAffirmation);
// Must be last (otherwise it catches routes like `/saved`)
router.get("/:id", affirmation_controller_1.AffirmationController.getAffirmationById);
exports.AffirmationRoutes = router;
