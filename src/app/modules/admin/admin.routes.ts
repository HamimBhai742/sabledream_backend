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

export const AdminRoutes = router;
