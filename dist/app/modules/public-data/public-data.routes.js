"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicDataRoutes = void 0;
const express_1 = require("express");
const public_data_controller_1 = require("./public-data.controller");
const router = (0, express_1.Router)();
// Single endpoint to get all collections (users, journals, affirmations, moods) unified
router.get("/", public_data_controller_1.PublicDataController.getPublicData);
exports.PublicDataRoutes = router;
