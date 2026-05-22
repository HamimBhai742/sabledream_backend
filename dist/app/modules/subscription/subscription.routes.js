"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const subscription_controller_1 = require("./subscription.controller");
const router = (0, express_1.Router)();
// Retrieve user's current subscription details
router.get("/me", (0, checkAuth_1.default)("user", "admin"), subscription_controller_1.SubscriptionController.getSubscriptionDetails);
// Retrieve user's transaction/billing history
router.get("/billing-history", (0, checkAuth_1.default)("user", "admin"), subscription_controller_1.SubscriptionController.getBillingHistory);
// Manually trigger a synchronization check with RevenueCat
router.post("/sync", (0, checkAuth_1.default)("user", "admin"), subscription_controller_1.SubscriptionController.syncSubscription);
// Webhook listener for background events from RevenueCat
router.post("/webhook", subscription_controller_1.SubscriptionController.handleWebhook);
exports.SubscriptionRoutes = router;
