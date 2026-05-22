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
const http_status_1 = __importDefault(require("http-status"));
const verifyToken_1 = __importDefault(require("../utils/verifyToken"));
const AppError_1 = __importDefault(require("../error/AppError"));
const config_1 = __importDefault(require("../config"));
const checkAuth = (...requiredRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Authorization token is missing");
        }
        const [bearer, token] = authHeader.split(" ");
        if (bearer !== "Bearer" || !token) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid authorization token format");
        }
        const decoded = (0, verifyToken_1.default)(token, config_1.default.jwt_access_secret);
        if (requiredRoles.length &&
            (!decoded.role || !requiredRoles.includes(decoded.role))) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not authorized to access this resource");
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.default = checkAuth;
