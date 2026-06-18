import { Router } from "express";
import checkAuth from "../../middleware/checkAuth";
import { upload } from "../../middleware/upload";
import { UserController } from "./user.controller";

const router = Router();

router.patch(
  "/update-profile",
  checkAuth("user", "admin"),
  upload.single("image"),
  UserController.updateProfile
);

router.post(
  "/change-password",
  checkAuth("user", "admin"),
  UserController.changePassword
);

router.get(
  "/download-data",
  checkAuth("user", "admin"),
  UserController.downloadMyData
);

router.delete(
  "/delete-account",
  checkAuth("user", "admin"),
  UserController.deleteAccount
);

router.delete(
  "/delete-profile-image",
  checkAuth("user", "admin"),
  UserController.deleteProfileImage
);

router.patch(
  "/privacy-settings",
  checkAuth("user", "admin"),
  UserController.updatePrivacySettings
);

router.patch(
  "/update-fcm-token",
  checkAuth("user", "admin"),
  UserController.updateFcmToken
);

export const UserRoutes = router;

