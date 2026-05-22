"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorHandler_1 = __importDefault(require("./app/middleware/globalErrorHandler"));
const routes_1 = require("./app/routes");
// Initialize the Express application
const app = (0, express_1.default)();
// ==========================================
// Global Middlewares
// ==========================================
// Enable Cross-Origin Resource Sharing
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
// Parse cookies and populate req.cookies
app.use((0, cookie_parser_1.default)());
// Parse incoming JSON requests and put the parsed data in req.body
app.use(express_1.default.json());
// Parse incoming URL-encoded data
app.use(express_1.default.urlencoded({ extended: true }));
// ==========================================
// Application Routes
// ==========================================
// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running smoothly!',
        timestamp: new Date().toISOString(),
    });
});
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Sabledream API'
    });
});
// Mount modular routes here
app.use('/api/v1', routes_1.rootRouter);
// ==========================================
// Error Handling
// ==========================================
// 404 Not Found Middleware
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
});
// Global Error Handler
app.use(globalErrorHandler_1.default);
exports.default = app;
