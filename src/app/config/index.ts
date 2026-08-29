import "dotenv/config";

export default {
  port: Number(process.env.PORT),
  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
  jwt_access_expire:process.env.JWT_ACCESS_EXPIRES_IN as string,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  jwt_refresh_expire: process.env.JWT_REFRESH_EXPIRES_IN as string,
  dev_snapshot_key: process.env.DEV_SNAPSHOT_KEY as string,
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
  },
  revenueCat: {
    apiKey: process.env.REVENUECAT_API_KEY as string,
    webhookAuth: process.env.REVENUECAT_WEBHOOK_AUTH as string,
  },
  aiService: {
    apiKey: process.env.AI_SERVICE_API_KEY as string,
  },
  googleBooks: {
    apiKey: process.env.GOOGLE_BOOKS_API_KEY as string,
  },
  sableDreamChat: {
    baseUrl: (process.env.SABLE_DREAM_CHAT_BASE_URL as string) || "http://187.127.83.15:8900",
    apiKey: process.env.SABLE_DREAM_CHAT_API_KEY as string,
    timeoutMs: Number(process.env.SABLE_DREAM_CHAT_TIMEOUT_MS || 15000),
  },
  nodeEnv: process.env.NODE_ENV as string,
};
