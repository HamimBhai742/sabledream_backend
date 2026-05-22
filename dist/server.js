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
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const config_1 = __importDefault(require("./app/config"));
const connectToDatabase_1 = require("./app/db/connectToDatabase");
const notificationScheduler_1 = require("./app/utils/notificationScheduler");
const PORT = config_1.default.port || 5000;
// Create HTTP server instance
const server = http_1.default.createServer(app_1.default);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, connectToDatabase_1.connectToDatabase)();
        server.listen(PORT, () => {
            console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            // Start the scheduled push notification checker
            (0, notificationScheduler_1.startNotificationScheduler)();
        });
    }
    catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
});
startServer();
// ==========================================
// Graceful Shutdown & Global Error Handlers
// ==========================================
// Handle uncaught exceptions synchronously
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});
// Handle unhandled promise rejections asynchronously
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    server.close(() => {
        process.exit(1);
    });
});
// Handle SIGTERM (e.g., from Docker, Heroku, or K8s)
process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully.');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});
