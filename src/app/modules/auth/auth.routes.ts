import { Router } from "express";
import { AuthController } from "./auth.controller";
import checkAuth from "../../middleware/checkAuth";

const router = Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/resend-otp", AuthController.resendOtp);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/reset-password", AuthController.resetPassword);
router.post("/google-login", AuthController.googleLoginController);
router.post("/apple-login", AuthController.appleLoginController);
router.post("/logout", AuthController.logoutUser);
router.get("/me", checkAuth("user", "admin"), AuthController.getMe);
router.post("/refresh-token", AuthController.refreshTokenController);

export const AuthRoutes = router;
