import { Router } from "express";
import checkAuth from "../../middleware/checkAuth";
import { SubscriptionController } from "./subscription.controller";

const router = Router();

// Retrieve user's current subscription details
router.get(
  ["/me", "/details"],
  checkAuth("user", "admin"),
  SubscriptionController.getSubscriptionDetails
);

// Retrieve user's transaction/billing history
router.get(
  "/billing-history",
  checkAuth("user", "admin"),
  SubscriptionController.getBillingHistory
);

// Manually trigger a synchronization check with RevenueCat
router.post(
  "/sync",
  checkAuth("user", "admin"),
  SubscriptionController.syncSubscription
);

// Webhook listener for background events from RevenueCat
router.post(
  "/webhook",
  SubscriptionController.handleWebhook
);

export const SubscriptionRoutes = router;
