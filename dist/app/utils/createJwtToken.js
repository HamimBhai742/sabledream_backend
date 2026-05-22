"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../error/AppError"));
const createToken = (payload, secret, expiresIn) => {
    if (!secret) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "JWT secret is not configured");
    }
    if (!(payload === null || payload === void 0 ? void 0 : payload.userId) || !(payload === null || payload === void 0 ? void 0 : payload.email)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid JWT payload");
    }
    const token = jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn,
    });
    return token;
};
exports.default = createToken;
