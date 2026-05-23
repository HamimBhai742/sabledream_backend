import app from "./app";
import http from "http";
import config from "./app/config";
import { connectToDatabase } from "./app/db/connectToDatabase";
import { startNotificationScheduler } from "./app/utils/notificationScheduler";
import { seedAdminFunction } from "./app/db/seedAdminFunction";

const PORT = config.port || 5000;

// Create HTTP server instance
const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectToDatabase();
    const seedResult = await seedAdminFunction();
    console.log(seedAdminFunction);
    if (seedResult.status === "created") {
      console.log(
        `[seedAdmin] created admin: ${seedResult.email} (${seedResult.adminId})`,
      );
    } else if (seedResult.status === "exists") {
      console.log(
        `[seedAdmin] admin exists: ${seedResult.email} (${seedResult.adminId})`,
      );
    } else {
      console.log(`[seedAdmin] skipped: ${seedResult.reason}`);
    }
    server.listen(PORT, () => {
      console.log(
        `Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
      );
      // Start the scheduled push notification checker
      startNotificationScheduler();
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();

// ==========================================
// Graceful Shutdown & Global Error Handlers
// ==========================================

// Handle uncaught exceptions synchronously
process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections asynchronously
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (e.g., from Docker, Heroku, or K8s)
process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED. Shutting down gracefully.");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
