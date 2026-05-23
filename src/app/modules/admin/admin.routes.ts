import { Router } from "express";
import checkAuth from "../../middleware/checkAuth";
import { AdminController } from "./admin.controller";
import validateRequest from "../../middleware/validateRequest";
import { AdminValidation } from "./admin.validation";

const router = Router();

router.use(checkAuth("admin"));

router.get("/overview", AdminController.getOverview);

router.get("/users", AdminController.getUsers);
router.get("/users/:userId", AdminController.getUserDetails);

router.patch(
  "/users/:userId/status",
  validateRequest(AdminValidation.updateUserStatusSchema),
  AdminController.updateUserStatus,
);

router.patch(
  "/users/:userId/role",
  validateRequest(AdminValidation.updateUserRoleSchema),
  AdminController.updateUserRole,
);

router.get("/content/journals", AdminController.getAllJournals);
router.get("/content/manifestations", AdminController.getAllManifestations);
router.get("/content/moods/analytics", AdminController.getMoodAnalytics);

router.get("/subscriptions/active", AdminController.getActiveSubscriptions);
router.get("/subscriptions/transactions", AdminController.getTransactions);
router.get("/subscriptions/summary", AdminController.getSubscriptionSummary);

export const AdminRoutes = router;
