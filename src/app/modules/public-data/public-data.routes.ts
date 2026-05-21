import { Router } from "express";
import { PublicDataController } from "./public-data.controller";

const router = Router();

// Single endpoint to get all collections (users, journals, affirmations, moods) unified
router.get("/", PublicDataController.getPublicData);

export const PublicDataRoutes = router;

