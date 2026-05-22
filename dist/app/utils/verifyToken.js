"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../error/AppError"));
const verifyToken = (token, secret) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.userId) || !(decoded === null || decoded === void 0 ? void 0 : decoded.email)) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token payload");
        }
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Token has expired");
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token");
        }
        throw error;
    }
};
exports.default = verifyToken;
