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
exports.SubscriptionController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsyncFn_1 = __importDefault(require("../../utils/catchAsyncFn"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const config_1 = __importDefault(require("../../config"));
const subscription_service_1 = require("./subscription.service");
/**
 * Get active subscription details mapped for Figma UI views
 */
const getSubscriptionDetails = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = yield subscription_service_1.SubscriptionService.getSubscriptionDetails(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription details retrieved successfully",
        data: result,
    });
}));
/**
 * Get formatted invoice history for Billing History view
 */
const getBillingHistory = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = yield subscription_service_1.SubscriptionService.getBillingHistory(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Billing history retrieved successfully",
        data: result,
    });
}));
/**
 * Manually synchronize database with RevenueCat API
 */
const syncSubscription = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = yield subscription_service_1.SubscriptionService.syncRevenueCatSubscription(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription synced successfully with RevenueCat",
        data: result,
    });
}));
/**
 * Webhook ingest for RevenueCat background sync events
 */
const handleWebhook = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const webhookAuth = config_1.default.revenueCat.webhookAuth;
    // Verify authorization secret if it is configured in env variables
    if (webhookAuth) {
        const expectedAuth = webhookAuth.startsWith("Bearer ") ? webhookAuth : `Bearer ${webhookAuth}`;
        if (!authHeader || authHeader !== expectedAuth) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized webhook source");
        }
    }
    const result = yield subscription_service_1.SubscriptionService.handleRevenueCatWebhook(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: result,
    });
}));
exports.SubscriptionController = {
    getSubscriptionDetails,
    getBillingHistory,
    syncSubscription,
    handleWebhook,
};
