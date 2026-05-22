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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;
const firebase_1 = require("../config/firebase");
const prisma_1 = require("../lib/prisma");
const sendPushNotification = (fcmToken, title, body, data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = {
            notification: {
                title,
                body,
            },
            token: fcmToken,
            data: data || {},
        };
        let response = null;
        try {
            response = yield firebase_1.fcm.send(message);
            console.log(`[FCM] Notification sent successfully. Response: ${response}`);
        }
        catch (fcmError) {
            console.error(`[FCM] Error sending push notification via Firebase:`, fcmError);
        }
        // Persist notification in database if userId is provided
        if (userId) {
            try {
                yield prisma_1.prisma.notification.create({
                    data: {
                        userId,
                        title,
                        body,
                        data: data || {},
                    },
                });
                console.log(`[DATABASE] In-app notification logged in DB for user ${userId}`);
            }
            catch (dbError) {
                console.error(`[DATABASE] Failed to log notification in DB:`, dbError);
            }
        }
        return response;
    }
    catch (error) {
        console.error(`[FCM] Error in sendPushNotification:`, error);
        return null;
    }
});
exports.sendPushNotification = sendPushNotification;
