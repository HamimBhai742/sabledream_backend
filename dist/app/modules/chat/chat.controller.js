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
exports.ChatController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const catchAsyncFn_1 = __importDefault(require("../../utils/catchAsyncFn"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const chat_service_1 = require("./chat.service");
const isTruthy = (value) => {
    if (Array.isArray(value))
        return value.some((v) => v === "1" || v === "true" || v === true);
    return value === "1" || value === "true" || value === true;
};
const resolveUserId = (req, requestedUserId) => {
    var _a, _b;
    const authUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    const normalizedUserId = Array.isArray(requestedUserId) ? requestedUserId[0] : requestedUserId;
    if (!authUserId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    if (normalizedUserId !== undefined && normalizedUserId.trim().length === 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "user_id is required");
    }
    if (normalizedUserId && normalizedUserId !== authUserId && role !== "admin") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not authorized to access this user's chat");
    }
    return normalizedUserId || authUserId;
};
const sendMessage = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const raw = isTruthy(req.query.raw);
    const userId = resolveUserId(req, req.body.user_id);
    const result = yield chat_service_1.ChatService.sendMessage(userId, req.body.message);
    if (raw) {
        res.status(http_status_1.default.OK).json(result);
        return;
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chat reply generated successfully",
        data: result,
    });
}));
const getHistory = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const raw = isTruthy(req.query.raw);
    const userId = resolveUserId(req, req.params.user_id);
    const result = yield chat_service_1.ChatService.getHistory(userId);
    if (raw) {
        res.status(http_status_1.default.OK).json(result);
        return;
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chat history retrieved successfully",
        data: result,
    });
}));
const deleteHistory = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const raw = isTruthy(req.query.raw);
    const userId = resolveUserId(req, req.params.user_id);
    const result = yield chat_service_1.ChatService.deleteHistory(userId);
    if (raw) {
        res.status(http_status_1.default.OK).json(result);
        return;
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chat history deleted successfully",
        data: result,
    });
}));
const getMemory = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const raw = isTruthy(req.query.raw);
    const userId = resolveUserId(req, req.params.user_id);
    const result = yield chat_service_1.ChatService.getMemory(userId);
    if (raw) {
        res.status(http_status_1.default.OK).json(result);
        return;
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chat memory retrieved successfully",
        data: result,
    });
}));
exports.ChatController = {
    sendMessage,
    getHistory,
    deleteHistory,
    getMemory,
};
