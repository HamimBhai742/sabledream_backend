import { Router } from "express";
import { AffirmationController } from "./affirmation.controller";
import checkAuth from "../../middleware/checkAuth";

const router = Router();

// Public / Authenticated Routes
router.get("/today", AffirmationController.getTodayAffirmation);
router.get("/", AffirmationController.getAllAffirmations);

// Saved Affirmations (Authenticated)
router.get("/saved", checkAuth("user", "admin"), AffirmationController.getSavedAffirmations);
router.post("/:id/save", checkAuth("user", "admin"), AffirmationController.saveAffirmation);
router.delete("/:id/unsave", checkAuth("user", "admin"), AffirmationController.unsaveAffirmation);

// Admin-only creation
router.post("/", checkAuth("admin"), AffirmationController.createAffirmation);

// Must be last (otherwise it catches routes like `/saved`)
router.get("/:id", AffirmationController.getAffirmationById);

export const AffirmationRoutes = router;
