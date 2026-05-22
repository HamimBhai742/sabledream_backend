"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalRoutes = void 0;
const express_1 = require("express");
const journal_controller_1 = require("./journal.controller");
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const journal_valadition_schema_1 = require("./journal.valadition.schema");
const upload_1 = require("../../middleware/upload");
const router = (0, express_1.Router)();
router.post("/category", (0, checkAuth_1.default)("user", "admin"), (0, validateRequest_1.default)(journal_valadition_schema_1.createCategorySchema), journal_controller_1.JournalController.createCategory);
router.get("/category", (0, checkAuth_1.default)("user", "admin"), journal_controller_1.JournalController.getMyCategories);
router.get("/my-journals", (0, checkAuth_1.default)("user", "admin"), journal_controller_1.JournalController.getMyJournals);
router.get("/all-journals", (0, checkAuth_1.default)("admin"), journal_controller_1.JournalController.getAllJournals);
router.post("/create", (0, checkAuth_1.default)("user", "admin"), upload_1.upload.single("file"), (0, validateRequest_1.default)(journal_valadition_schema_1.createJournalSchema), journal_controller_1.JournalController.createJournal);
/**
 * Single journal routes
 */
router.get("/:journalId", (0, checkAuth_1.default)("user", "admin"), journal_controller_1.JournalController.getJournalById);
router.patch("/:journalId", (0, checkAuth_1.default)("user", "admin"), upload_1.upload.single("file"), (0, validateRequest_1.default)(journal_valadition_schema_1.updateJournalSchema), journal_controller_1.JournalController.updateJournal);
router.delete("/:journalId", (0, checkAuth_1.default)("user", "admin"), journal_controller_1.JournalController.deleteJournal);
exports.JournalRoutes = router;
