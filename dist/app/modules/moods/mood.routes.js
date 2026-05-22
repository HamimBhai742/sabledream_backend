"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodRoutes = void 0;
const express_1 = require("express");
const mood_controller_1 = require("./mood.controller");
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const mood_validation_1 = require("./mood.validation");
const router = (0, express_1.Router)();
router.post('/create', (0, checkAuth_1.default)('user', 'admin'), (0, validateRequest_1.default)(mood_validation_1.MoodValidation.moodValidationSchema), mood_controller_1.MoodController.createOrUpdateMood);
router.get('/my-mood', (0, checkAuth_1.default)('user', 'admin'), mood_controller_1.MoodController.getMoodByDate);
router.get('/calendar', (0, checkAuth_1.default)('user', 'admin'), mood_controller_1.MoodController.getMoodsByDateRange);
router.get('/history', (0, checkAuth_1.default)('user', 'admin'), mood_controller_1.MoodController.getMoodHistory);
exports.MoodRoutes = router;
