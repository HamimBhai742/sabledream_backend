"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestationRoutes = void 0;
const express_1 = require("express");
const manifestation_controller_1 = require("./manifestation.controller");
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const upload_1 = require("../../middleware/upload");
const router = (0, express_1.Router)();
router.post('/create', (0, checkAuth_1.default)('user', 'admin'), upload_1.upload.single('file'), manifestation_controller_1.ManifestationController.createManifestation);
router.get('/', (0, checkAuth_1.default)('user', 'admin'), manifestation_controller_1.ManifestationController.getMyManifestations);
router.get('/:manifestationId', (0, checkAuth_1.default)('user', 'admin'), manifestation_controller_1.ManifestationController.getManifestationById);
router.patch('/:manifestationId', (0, checkAuth_1.default)('user', 'admin'), upload_1.upload.single('file'), manifestation_controller_1.ManifestationController.updateManifestation);
router.delete('/:manifestationId', (0, checkAuth_1.default)('user', 'admin'), manifestation_controller_1.ManifestationController.deleteManifestation);
exports.ManifestationRoutes = router;
