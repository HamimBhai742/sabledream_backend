"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const prisma_1 = require("../../lib/prisma");
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
// Map Product ID to plan name, cost, and frequency
const PRODUCT_PLAN_MAP = {
    monthly_divine: {
        name: "Monthly — Divine",
        type: "monthly",
        amount: 5.0,
    },
    annual_becoming: {
        name: "Annual — Becoming",
        type: "annual",
        amount: 45.0,
    },
};
// Formatting utilities for Billing History to match the Figma UI perfectly
const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesStr}${ampm}`;
};
const padZero = (num) => {
    return num < 10 ? "0" + num : String(num);
};
const formatDate = (date) => {
    // Return format DD.MM.YY (e.g. 12.11.23)
    const day = padZero(date.getDate());
    const month = padZero(date.getMonth() + 1);
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
};
const getPlanMeta = (productId) => {
    if (!productId)
        return null;
    // Match exact mapping or try to guess based on ID containing monthly/annual
    if (PRODUCT_PLAN_MAP[productId]) {
        return PRODUCT_PLAN_MAP[productId];
    }
    const isAnnual = productId.toLowerCase().includes("annual") || productId.toLowerCase().includes("year");
    return {
        name: isAnnual ? "Annual — Premium" : "Monthly — Premium",
        type: isAnnual ? "annual" : "monthly",
        amount: isAnnual ? 45.0 : 5.0,
    };
};
exports.SubscriptionService = {
    /**
     * Fetch subscription info for a user. Mapped to Figma design specifications.
     */
    getSubscriptionDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.prisma.user.findUnique({
                where: { id: userId },
                include: { subscription: true },
            });
            if (!user) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
            }
            const sub = user.subscription;
            // Check if subscription has expired based on expiry date
            let status = "expired";
            let hasActivePremium = false;
            if (sub && sub.status !== "expired" && sub.expiresDate) {
                const now = new Date();
                if (sub.expiresDate > now) {
                    status = sub.status;
                    hasActivePremium = true;
                }
            }
            const planMeta = sub ? getPlanMeta(sub.productId) : null;
            // Build Figma UI mapping response
            return {
                status,
                currentPlan: {
                    name: planMeta ? planMeta.name : "Free Tier",
                    type: planMeta ? planMeta.type : "free",
                    productId: (sub === null || sub === void 0 ? void 0 : sub.productId) || null,
                    expiresAt: (sub === null || sub === void 0 ? void 0 : sub.expiresDate) || null,
                },
                billingDetails: {
                    nextBillingAmount: hasActivePremium && planMeta ? planMeta.amount : null,
                    nextBillingDate: hasActivePremium ? (sub === null || sub === void 0 ? void 0 : sub.expiresDate) || null : null,
                    paymentMethod: (sub === null || sub === void 0 ? void 0 : sub.paymentMethod) || "App Store",
                },
                hasActivePremium,
            };
        });
    },
    /**
     * Get billing history for the Figma "Billing history" screen.
     */
    getBillingHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield prisma_1.prisma.transaction.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });
            return transactions.map((tx) => {
                const isRefund = tx.type === "refund";
                const sign = isRefund ? "+" : "-";
                return {
                    id: tx.id,
                    name: tx.name || "User",
                    phone: tx.phone || "N/A",
                    transactionId: tx.transactionId,
                    amount: tx.amount,
                    formattedAmount: `${sign}$${Math.abs(tx.amount).toFixed(2)}`,
                    time: formatTime(tx.createdAt),
                    date: formatDate(tx.createdAt),
                    createdAt: tx.createdAt,
                };
            });
        });
    },
    /**
     * Sync a subscriber's state manually using RevenueCat REST API
     */
    syncRevenueCatSubscription(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const user = yield prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
            }
            const apiKey = config_1.default.revenueCat.apiKey;
            if (!apiKey) {
                throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "RevenueCat API key is not configured in backend env variables");
            }
            // Call RevenueCat GET subscriber API
            const response = yield fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                const errorText = yield response.text();
                throw new AppError_1.default(http_status_1.default.BAD_GATEWAY, `RevenueCat API error: ${response.statusText} - ${errorText}`);
            }
            const data = (yield response.json());
            const subscriber = data.subscriber;
            if (!subscriber) {
                throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Invalid response payload from RevenueCat");
            }
            // Determine the user's highest active entitlement
            const entitlements = subscriber.entitlements || {};
            let activeEntitlementKey = null;
            let activeEntitlement = null;
            for (const key of Object.keys(entitlements)) {
                const entitlement = entitlements[key];
                const expiresDateStr = entitlement.expires_date;
                if (expiresDateStr) {
                    const expiresDate = new Date(expiresDateStr);
                    if (expiresDate > new Date()) {
                        activeEntitlementKey = key;
                        activeEntitlement = entitlement;
                        break; // Found an active entitlement
                    }
                }
                else {
                    // Lifetime or no expiry
                    activeEntitlementKey = key;
                    activeEntitlement = entitlement;
                    break;
                }
            }
            if (activeEntitlementKey && activeEntitlement) {
                const productId = activeEntitlement.product_identifier;
                const planMeta = getPlanMeta(productId);
                const isTrial = activeEntitlement.period_type === "trial";
                const status = isTrial ? "trial" : "active";
                const planType = planMeta ? planMeta.type : "free";
                const subscriptionData = {
                    status: status,
                    planType: planType,
                    productId,
                    expiresDate: activeEntitlement.expires_date ? new Date(activeEntitlement.expires_date) : null,
                    purchaseDate: activeEntitlement.purchase_date ? new Date(activeEntitlement.purchase_date) : null,
                    originalPurchaseDate: activeEntitlement.original_purchase_date
                        ? new Date(activeEntitlement.original_purchase_date)
                        : null,
                    paymentMethod: ((_b = (_a = subscriber.subscriptions) === null || _a === void 0 ? void 0 : _a[productId]) === null || _b === void 0 ? void 0 : _b.store) || "App Store",
                    revenueCatUserId: userId,
                };
                // Upsert Subscription
                yield prisma_1.prisma.subscription.upsert({
                    where: { userId },
                    update: subscriptionData,
                    create: Object.assign({ userId }, subscriptionData),
                });
                // Synchronize Transactions if they are available in the RevenueCat payload
                const subscriptions = subscriber.subscriptions || {};
                const subDetails = subscriptions[productId];
                if (subDetails && subDetails.store_transaction_id) {
                    const txId = subDetails.store_transaction_id;
                    const txAmount = planMeta ? planMeta.amount : 0.0;
                    yield prisma_1.prisma.transaction.upsert({
                        where: { transactionId: txId },
                        update: {
                            status: "success",
                        },
                        create: {
                            userId,
                            transactionId: txId,
                            amount: txAmount,
                            status: "success",
                            name: user.name,
                            phone: user.phone || null,
                            type: "charge",
                        },
                    });
                }
            }
            else {
                // Exited or has no active entitlements, mark as expired
                const expiredData = {
                    status: "expired",
                    planType: "free",
                    productId: null,
                    expiresDate: null,
                    purchaseDate: null,
                    nextBillingAmount: null,
                    nextBillingDate: null,
                };
                yield prisma_1.prisma.subscription.upsert({
                    where: { userId },
                    update: expiredData,
                    create: Object.assign({ userId }, expiredData),
                });
            }
            return this.getSubscriptionDetails(userId);
        });
    },
    /**
     * Process an incoming webhook from RevenueCat
     */
    handleRevenueCatWebhook(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = payload.event;
            if (!event) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid webhook structure: Missing 'event' object.");
            }
            const eventType = event.type;
            const userId = event.app_user_id;
            if (!userId) {
                console.warn("[RevenueCat Webhook] Warning: Missing app_user_id in event.");
                return { success: false, message: "Missing app_user_id" };
            }
            // Retrieve the user from our database
            const user = yield prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                console.warn(`[RevenueCat Webhook] Warning: User with ID ${userId} not found in our database. Skipping update.`);
                return { success: false, message: "User not found in local database" };
            }
            const productId = event.product_id;
            const planMeta = getPlanMeta(productId);
            const expiresDate = event.expiration_at_ms ? new Date(event.expiration_at_ms) : null;
            const purchaseDate = event.purchased_at_ms ? new Date(event.purchased_at_ms) : null;
            const originalPurchaseDate = event.original_purchased_at_ms ? new Date(event.original_purchased_at_ms) : null;
            const store = event.store || "App Store";
            let status = "expired";
            let planType = "free";
            // Standardize event types
            switch (eventType) {
                case "INITIAL_PURCHASE":
                case "RENEWAL":
                case "PRODUCT_CHANGE":
                    const isTrial = event.period_type === "TRIAL";
                    status = isTrial ? "trial" : "active";
                    planType = planMeta ? planMeta.type : "free";
                    break;
                case "EXPIRATION":
                    status = "expired";
                    planType = "free";
                    break;
                case "CANCELLATION":
                    // Auto-renew was turned off, but standard practice is to keep access until the expiration date.
                    // Let's verify if the expiresDate is in the future.
                    if (expiresDate && expiresDate > new Date()) {
                        const isTrialCancel = event.period_type === "TRIAL";
                        status = isTrialCancel ? "trial" : "active";
                        planType = planMeta ? planMeta.type : "free";
                    }
                    else {
                        status = "expired";
                        planType = "free";
                    }
                    break;
                case "BILLING_ISSUE":
                    // Subscriptions that fail renewal will transition to expired (or grace period, which we simplify to expired for now)
                    status = "expired";
                    planType = "free";
                    break;
                default:
                    // For other events (e.g. SUBSCRIBER_ALIAS, TRANSFER), let's keep current state or skip
                    return { success: true, message: `Skipping unmapped event type: ${eventType}` };
            }
            const subscriptionData = {
                status,
                planType,
                productId: status === "expired" ? null : productId,
                expiresDate,
                purchaseDate,
                originalPurchaseDate,
                paymentMethod: store,
                revenueCatUserId: userId,
            };
            // Upsert the subscription
            yield prisma_1.prisma.subscription.upsert({
                where: { userId },
                update: subscriptionData,
                create: Object.assign({ userId }, subscriptionData),
            });
            // Create a transaction record for charges or refunds
            if (event.transaction_id && event.price !== undefined) {
                const txId = event.transaction_id;
                const amount = event.price;
                const type = eventType === "CANCELLATION" && event.cancel_reason === "UNSUBSCRIBE" ? "charge" :
                    (eventType === "CANCELLATION" ? "refund" : "charge");
                yield prisma_1.prisma.transaction.upsert({
                    where: { transactionId: txId },
                    update: {
                        status: "success",
                    },
                    create: {
                        userId,
                        transactionId: txId,
                        amount: amount,
                        status: "success",
                        name: user.name,
                        phone: user.phone || null,
                        type,
                    },
                });
            }
            console.log(`[RevenueCat Webhook] Success: Handled ${eventType} for User ${userId}`);
            return { success: true, message: `Successfully handled event: ${eventType}` };
        });
    },
};
