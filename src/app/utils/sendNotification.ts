import { fcm } from "../config/firebase";
import { prisma } from "../lib/prisma";

export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>,
  userId?: string
) => {
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
      response = await fcm.send(message);
    } catch (fcmError) {
      console.error(`[FCM] Error sending push notification via Firebase:`, fcmError);
    }

    // Persist notification in database if userId is provided
    if (userId) {
      try {
        await prisma.notification.create({
          data: {
            userId,
            title,
            body,
            data: data || {},
          },
        });
      } catch (dbError) {
        console.error(`[DATABASE] Failed to log notification in DB:`, dbError);
      }
    }

    return response;
  } catch (error) {
    console.error(`[FCM] Error in sendPushNotification:`, error);
    return null;
  }
};

