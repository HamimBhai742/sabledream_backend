import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { JournalRoutes } from "../modules/journal/journal.routes";
import { MoodRoutes } from "../modules/moods/mood.routes";
import { ManifestationRoutes } from "../modules/manifestation/manifestation.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { AffirmationRoutes } from "../modules/affirmation/affirmation.routes";
import { ReminderRoutes } from "../modules/reminder/reminder.routes";
import { NotificationRoutes } from "../modules/notification/notification.routes";
import { SubscriptionRoutes } from "../modules/subscription/subscription.routes";
import { PublicDataRoutes } from "../modules/public-data/public-data.routes";
import { ChatRoutes } from "../modules/chat/chat.routes";
import { AdminRoutes } from "../modules/admin/admin.routes";
import { BooksRoutes } from "../modules/books/books.routes";
import { DailyReflectionRoutes } from "../modules/daily-reflection/daily-reflection.routes";
import { EventLogRoutes } from "../modules/event-log/event-log.routes";



export const rootRouter = Router();

const routes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/journals",
    route: JournalRoutes,
  },
  {
    path: "/moods",
    route: MoodRoutes,
  },
  {
    path: "/manifestations",
    route: ManifestationRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/affirmations",
    route: AffirmationRoutes,
  },
  {
    path: "/reminders",
    route: ReminderRoutes,
  },
  {
    path: "/notifications",
    route: NotificationRoutes,
  },
  {
    path: "/subscriptions",
    route: SubscriptionRoutes,
  },
  {
    path: "/subscription",
    route: SubscriptionRoutes,
  },
  {
    path: "/books",
    route: BooksRoutes,
  },
  {
    path: "/",
    route: PublicDataRoutes,
  },
  {
    path: "/chat",
    route: ChatRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/daily-reflections",
    route: DailyReflectionRoutes,
  },
  {
    path: "/event-logs",
    route: EventLogRoutes,
  },
];

routes.forEach((route) => {
  rootRouter.use(route.path, route.route);
});
