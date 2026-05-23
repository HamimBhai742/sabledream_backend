"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootRouter = void 0;
const express_1 = require("express");
const auth_routes_1 = require("../modules/auth/auth.routes");
const journal_routes_1 = require("../modules/journal/journal.routes");
const mood_routes_1 = require("../modules/moods/mood.routes");
const manifestation_routes_1 = require("../modules/manifestation/manifestation.routes");
const user_routes_1 = require("../modules/user/user.routes");
const affirmation_routes_1 = require("../modules/affirmation/affirmation.routes");
const reminder_routes_1 = require("../modules/reminder/reminder.routes");
const notification_routes_1 = require("../modules/notification/notification.routes");
const subscription_routes_1 = require("../modules/subscription/subscription.routes");
const public_data_routes_1 = require("../modules/public-data/public-data.routes");
const chat_routes_1 = require("../modules/chat/chat.routes");
const admin_routes_1 = require("../modules/admin/admin.routes");
exports.rootRouter = (0, express_1.Router)();
const routes = [
    {
        path: "/auth",
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: "/journals",
        route: journal_routes_1.JournalRoutes,
    },
    {
        path: "/moods",
        route: mood_routes_1.MoodRoutes,
    },
    {
        path: "/manifestations",
        route: manifestation_routes_1.ManifestationRoutes,
    },
    {
        path: "/users",
        route: user_routes_1.UserRoutes,
    },
    {
        path: "/affirmations",
        route: affirmation_routes_1.AffirmationRoutes,
    },
    {
        path: "/reminders",
        route: reminder_routes_1.ReminderRoutes,
    },
    {
        path: "/notifications",
        route: notification_routes_1.NotificationRoutes,
    },
    {
        path: "/subscriptions",
        route: subscription_routes_1.SubscriptionRoutes,
    },
    {
        path: "/",
        route: public_data_routes_1.PublicDataRoutes,
    },
    {
        path: "/chat",
        route: chat_routes_1.ChatRoutes,
    },
    {
        path: "/admin",
        route: admin_routes_1.AdminRoutes,
    },
];
routes.forEach((route) => {
    exports.rootRouter.use(route.path, route.route);
});
