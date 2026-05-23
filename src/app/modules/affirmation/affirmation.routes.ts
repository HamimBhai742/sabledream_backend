import { Router } from "express";
import { AffirmationController } from "./affirmation.controller";
import checkAuth from "../../middleware/checkAuth";
import validateRequest from "../../middleware/validateRequest";
import { AffirmationValidation } from "./affirmation.validation";

const router = Router();

// Public / Authenticated Routes
router.get("/today", AffirmationController.getTodayAffirmation);
router.get("/", AffirmationController.getAllAffirmations);

// Saved Affirmations (Authenticated)
router.get("/saved", checkAuth("user", "admin"), AffirmationController.getSavedAffirmations);
router.post("/:id/save", checkAuth("user", "admin"), AffirmationController.saveAffirmation);
router.delete("/:id/unsave", checkAuth("user", "admin"), AffirmationController.unsaveAffirmation);

// Admin-only creation
router.post(
  "/admin/create",
  checkAuth("admin"),
  validateRequest(AffirmationValidation.createAffirmationSchema),
  AffirmationController.createAffirmation,
);

router.patch(
  "/admin/:id",
  checkAuth("admin"),
  validateRequest(AffirmationValidation.updateAffirmationSchema),
  AffirmationController.updateAffirmation,
);

router.delete("/admin/:id", checkAuth("admin"), AffirmationController.deleteAffirmation);

// Must be last (otherwise it catches routes like `/saved`)
router.get("/admin/:id", AffirmationController.getAffirmationById);

export const AffirmationRoutes = router;
