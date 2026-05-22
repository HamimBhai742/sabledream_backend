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
exports.ChatService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const config_1 = __importDefault(require("../../config"));
const withTrailingSlash = (value) => (value.endsWith("/") ? value : `${value}/`);
const buildUrl = (path) => {
    var _a;
    const baseUrl = (_a = config_1.default.aknChat) === null || _a === void 0 ? void 0 : _a.baseUrl;
    if (!baseUrl) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "AKN chat base URL is not configured (AKN_CHAT_BASE_URL)");
    }
    return new URL(path.replace(/^\//, ""), withTrailingSlash(baseUrl)).toString();
};
const parseErrorBody = (response) => __awaiter(void 0, void 0, void 0, function* () {
    const contentType = response.headers.get("content-type") || "";
    try {
        if (contentType.includes("application/json")) {
            return yield response.json();
        }
        return yield response.text();
    }
    catch (_a) {
        return null;
    }
});
const requestAknChat = (path, init, timeoutMs) => __awaiter(void 0, void 0, void 0, function* () {
    const url = buildUrl(path);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs !== null && timeoutMs !== void 0 ? timeoutMs : config_1.default.aknChat.timeoutMs);
    try {
        const headers = Object.assign({ Accept: "application/json" }, init.headers);
        const apiKey = config_1.default.aknChat.apiKey;
        if (apiKey) {
            headers.Authorization = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
        }
        const response = yield fetch(url, Object.assign(Object.assign({}, init), { headers, signal: controller.signal }));
        if (!response.ok) {
            const errorBody = yield parseErrorBody(response);
            const details = errorBody && typeof errorBody === "object"
                ? JSON.stringify(errorBody)
                : typeof errorBody === "string"
                    ? errorBody
                    : "";
            throw new AppError_1.default(http_status_1.default.BAD_GATEWAY, `AKN chat service error (${response.status})${details ? `: ${details}` : ""}`);
        }
        return (yield response.json());
    }
    catch (err) {
        if (err instanceof AppError_1.default) {
            throw err;
        }
        if ((err === null || err === void 0 ? void 0 : err.name) === "AbortError") {
            throw new AppError_1.default(http_status_1.default.GATEWAY_TIMEOUT, "AKN chat service request timed out");
        }
        throw new AppError_1.default(http_status_1.default.BAD_GATEWAY, "Failed to reach AKN chat service");
    }
    finally {
        clearTimeout(timeout);
    }
});
exports.ChatService = {
    sendMessage(userId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return requestAknChat("/api/v1/chat/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, message }),
            }, config_1.default.aknChat.timeoutMs);
        });
    },
    getHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return requestAknChat(`/api/v1/chat/history/${encodeURIComponent(userId)}`, { method: "GET" });
        });
    },
    deleteHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return requestAknChat(`/api/v1/chat/history/${encodeURIComponent(userId)}`, { method: "DELETE" });
        });
    },
    getMemory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return requestAknChat(`/api/v1/chat/memory/${encodeURIComponent(userId)}`, { method: "GET" });
        });
    },
};
