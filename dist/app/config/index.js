"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
exports.default = {
    port: Number(process.env.PORT),
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_access_expire: process.env.JWT_ACCESS_EXPIRES_IN,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_expire: process.env.JWT_REFRESH_EXPIRES_IN,
    dev_snapshot_key: process.env.DEV_SNAPSHOT_KEY,
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    },
    revenueCat: {
        apiKey: process.env.REVENUECAT_API_KEY,
        webhookAuth: process.env.REVENUECAT_WEBHOOK_AUTH,
    },
    aiService: {
        apiKey: process.env.AI_SERVICE_API_KEY,
    },
    aknChat: {
        baseUrl: process.env.AKN_CHAT_BASE_URL || "http://187.127.83.15:8900",
        apiKey: process.env.AKN_CHAT_API_KEY,
        timeoutMs: Number(process.env.AKN_CHAT_TIMEOUT_MS || 15000),
    },
};
