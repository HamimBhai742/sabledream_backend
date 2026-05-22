"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthTokens = void 0;
const createJwtToken_1 = __importDefault(require("./createJwtToken"));
const createAuthTokens = (user) => {
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, createJwtToken_1.default)(jwtPayload, process.env.JWT_ACCESS_SECRET, process.env.JWT_ACCESS_EXPIRES_IN || "15m");
    const refreshToken = (0, createJwtToken_1.default)(jwtPayload, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN || "7d");
    return {
        accessToken,
        refreshToken,
    };
};
exports.createAuthTokens = createAuthTokens;
