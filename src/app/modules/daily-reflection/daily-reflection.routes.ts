import { Router } from "express";
import { DailyReflectionController } from "./daily-reflection.controller";
import checkAuth from "../../middleware/checkAuth";
import { uploadCSV } from "../../middleware/upload";
import validateRequest from "../../middleware/validateRequest";
import { DailyReflectionValidation } from "./daily-reflection.validation";

const router = Router();

// Admin endpoints
router.post(
  "/upload",
  checkAuth("admin"),
  uploadCSV.single("file"),
  DailyReflectionController.uploadCSV
);

router.get(
  "/admin",
  checkAuth("admin"),
  DailyReflectionController.getAllDailyReflections
);

router.delete(
  "/:id",
  checkAuth("admin"),
  DailyReflectionController.deleteDailyReflection
);

router.patch(
  "/:id",
  checkAuth("admin"),
  validateRequest(DailyReflectionValidation.updateDailyReflectionSchema),
  DailyReflectionController.updateDailyReflection
);

// Public endpoint
router.get(
  "/public",
  DailyReflectionController.getDailyReflectionByDate
);

export const DailyReflectionRoutes = router;
