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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const prisma_1 = require("../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createAuthTokens_1 = require("../../utils/createAuthTokens");
const crypto_1 = __importDefault(require("crypto"));
const forgetPassword_1 = require("../../utils/emailTemplates/forgetPassword");
const resetPasswordSuccess_1 = require("../../utils/emailTemplates/resetPasswordSuccess");
const google_auth_library_1 = require("google-auth-library");
const apple_token_1 = require("../../utils/apple.token");
const verifyToken_1 = __importDefault(require("../../utils/verifyToken"));
const createJwtToken_1 = __importDefault(require("../../utils/createJwtToken"));
const signUpSuccess_1 = require("../../utils/emailTemplates/signUpSuccess");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const registerUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the user already exists
    const existingUser = yield prisma_1.prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (existingUser) {
        if (!existingUser.password) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, "Email is already registered via social login. Please log in using Google or Apple.");
        }
        throw new AppError_1.default(http_status_1.default.CONFLICT, "User with this email already exists");
    }
    // Hash the password
    const hashedPassword = yield bcryptjs_1.default.hash(payload.password, 10);
    // Create the user
    const newUser = yield prisma_1.prisma.user.create({
        data: {
            name: payload.name,
            email: payload.email,
            password: hashedPassword,
            isVerified: true, // Auto-verified based on user request (no OTP needed)
        },
    });
    // Generate tokens
    const tokens = (0, createAuthTokens_1.createAuthTokens)({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
    });
    // Remove the password field from the returned user object
    const { password } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
    yield (0, signUpSuccess_1.welcomeSableDreamTemplate)({
        userName: newUser.name,
        email: newUser.email,
        joinedAt: new Date().toLocaleString("en-BD", {
            timeZone: "Asia/Dhaka",
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        }),
    });
    return Object.assign({ user: userWithoutPassword }, tokens);
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (!user.password) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Please login with social login");
    }
    const isPasswordMatched = yield bcryptjs_1.default.compare(payload.password, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid password");
    }
    const tokens = (0, createAuthTokens_1.createAuthTokens)({
        id: user.id,
        email: user.email,
        role: user.role,
    });
    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
    return Object.assign({ user: userWithoutPassword }, tokens);
});
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User with this email not found");
    }
    if (!user.password) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This account uses social login. Password reset is not applicable.");
    }
    // Generate a random 64-character hex string as a token
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    // Hash the token for storing in the database for security
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    // Token expires in 1 hour
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    yield prisma_1.prisma.user.update({
        where: { email },
        data: {
            forgetPasswordToken: hashedToken,
            forgetPasswordTokenExpires: tokenExpires,
        },
    });
    // Construct the reset URL
    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${email}`;
    try {
        const data = {
            userName: user.name,
            email,
            resetUrl,
            requestedAt: new Date().toLocaleString("en-BD", {
                timeZone: "Asia/Dhaka",
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            }),
        };
        yield (0, forgetPassword_1.forgotPasswordTemplate)(data);
    }
    catch (error) {
        yield prisma_1.prisma.user.update({
            where: { email },
            data: {
                forgetPasswordToken: null,
                forgetPasswordTokenExpires: null,
            },
        });
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "There was an error sending the password reset email. Try again later.");
    }
    return { message: "Password reset link sent to your email" };
});
const resetPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, token, newPassword } = payload;
    const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const user = yield prisma_1.prisma.user.findFirst({
        where: {
            email,
            forgetPasswordToken: hashedToken,
            forgetPasswordTokenExpires: {
                gt: new Date(),
            },
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Token is invalid or has expired");
    }
    const newHashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
    yield prisma_1.prisma.user.update({
        where: { email },
        data: {
            password: newHashedPassword,
            forgetPasswordToken: null,
            forgetPasswordTokenExpires: null,
        },
    });
    const data = {
        userName: user.name,
        email,
        resetAt: new Date().toLocaleString("en-BD", {
            timeZone: "Asia/Dhaka",
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        }),
    };
    yield (0, resetPasswordSuccess_1.resetPasswordSuccessTemplate)(data);
    return { message: "Password reset successfully" };
});
const googleLoginService = (idToken) => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = yield googleClient.verifyIdToken({
        idToken,
        audience: [
            process.env.GOOGLE_ANDROID_CLIENT_ID,
            process.env.GOOGLE_IOS_CLIENT_ID,
        ],
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid Google token");
    }
    const { email, name, picture, sub, email_verified } = payload;
    if (!email_verified) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Google email is not verified");
    }
    let user = yield prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        user = yield prisma_1.prisma.user.create({
            data: {
                email,
                name: name || "Google User",
                image: picture,
                provider: "GOOGLE",
                providerId: sub,
                isVerified: true,
            },
        });
    }
    else {
        // Optional: existing normal user hole Google info update korte paro
        user = yield prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                provider: user.provider || "GOOGLE",
                providerId: user.providerId || sub,
                image: user.image || picture,
                isVerified: true,
            },
        });
    }
    const tokens = (0, createAuthTokens_1.createAuthTokens)({
        id: user.id,
        email: user.email,
        role: user.role,
    });
    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
    return Object.assign({ user: userWithoutPassword }, tokens);
});
const appleLoginService = (idToken, fullName) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = yield (0, apple_token_1.verifyAppleToken)(idToken);
    if (!payload || !payload.email || !payload.sub) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid Apple login");
    }
    const email = payload.email;
    const providerId = payload.sub;
    let user = yield prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        user = yield prisma_1.prisma.user.create({
            data: {
                email,
                name: fullName || payload.name || "Apple User",
                provider: "APPLE",
                providerId,
                isVerified: true,
            },
        });
    }
    else {
        // If the user already exists, update their provider fields if not set
        user = yield prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                provider: user.provider || "APPLE",
                providerId: user.providerId || providerId,
                isVerified: true,
            },
        });
    }
    const tokens = (0, createAuthTokens_1.createAuthTokens)({
        id: user.id,
        email: user.email,
        role: user.role,
    });
    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
    return Object.assign({ user: userWithoutPassword }, tokens);
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
    return userWithoutPassword;
});
const refreshTokenService = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!refreshToken) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Refresh token is missing");
    }
    // Verify the refresh token
    const decoded = (0, verifyToken_1.default)(refreshToken, process.env.JWT_REFRESH_SECRET);
    // Fetch the user
    const user = yield prisma_1.prisma.user.findUnique({
        where: { id: decoded.userId },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (user.status !== "active") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "User account is suspended");
    }
    // Generate a new access token
    const accessToken = (0, createJwtToken_1.default)({
        userId: user.id,
        email: user.email,
        role: user.role,
    }, process.env.JWT_ACCESS_SECRET, process.env.JWT_ACCESS_EXPIRES_IN || "15m");
    return {
        accessToken,
    };
});
exports.AuthService = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    googleLoginService,
    appleLoginService,
    getMe,
    refreshTokenService,
};
