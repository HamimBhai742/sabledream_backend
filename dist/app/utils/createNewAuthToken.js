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
exports.createNewAuthToken = void 0;
const AppError_1 = __importDefault(require("../error/AppError"));
const prisma_1 = require("../lib/prisma");
const createJwtToken_1 = __importDefault(require("./createJwtToken"));
const verifyToken_1 = __importDefault(require("./verifyToken"));
const http_status_1 = __importDefault(require("http-status"));
const createNewAuthToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Refresh token not found");
    }
    const decoded = (0, verifyToken_1.default)(token, process.env.JWT_REFRESH_SECRET);
    const user = yield prisma_1.prisma.user.findUnique({
        where: {
            id: decoded.userId,
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const accessToken = (0, createJwtToken_1.default)({
        userId: user.id,
        email: user.email,
        role: user.role,
    }, process.env.JWT_ACCESS_SECRET, process.env.JWT_ACCESS_EXPIRES_IN || "15m");
    return {
        accessToken,
    };
});
exports.createNewAuthToken = createNewAuthToken;
