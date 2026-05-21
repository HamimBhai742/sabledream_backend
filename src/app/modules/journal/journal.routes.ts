import { Router } from "express";
import { JournalController } from "./journal.controller";
import checkAuth from "../../middleware/checkAuth";
import validateRequest from "../../middleware/validateRequest";
import {
  createCategorySchema,
  createJournalSchema,
  updateJournalSchema,
} from "./journal.valadition.schema";
import { upload } from "../../middleware/upload";

const router = Router();


router.post(
  "/category",
  checkAuth("user", "admin"),
  validateRequest(createCategorySchema),
  JournalController.createCategory
);

router.get(
  "/category",
  checkAuth("user", "admin"),
  JournalController.getMyCategories
);


router.get(
  "/my-journals",
  checkAuth("user", "admin"),
  JournalController.getMyJournals
);

router.get(
  "/all-journals",
  checkAuth("admin"),
  JournalController.getAllJournals
);


router.post(
  "/create",
  checkAuth("user", "admin"),
  upload.single("file"),
  validateRequest(createJournalSchema),
  JournalController.createJournal
);

/**
 * Single journal routes
 */
router.get(
  "/:journalId",
  checkAuth("user", "admin"),
  JournalController.getJournalById
);

router.patch(
  "/:journalId",
  checkAuth("user", "admin"),
  upload.single("file"),
  validateRequest(updateJournalSchema),
  JournalController.updateJournal
);

router.delete(
  "/:journalId",
  checkAuth("user", "admin"),
  JournalController.deleteJournal
);

export const JournalRoutes = router;