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
exports.UserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const prisma_1 = require("../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uploadCloudinary_1 = require("../../utils/uploadCloudinary");
const changePasswordSuccess_1 = require("../../utils/emailTemplates/changePasswordSuccess");
const deviceParser_1 = require("../../utils/deviceParser");
const deleteAccount_1 = require("../../utils/emailTemplates/deleteAccount");
const updateProfile = (userId, data, file) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    // Parse data if it is sent as stringified JSON (common in multipart form-data)
    const updateData = typeof data.data === "string" ? JSON.parse(data.data) : data;
    // Validate email uniqueness if email is being updated
    if (updateData.email && updateData.email !== user.email) {
        const existingEmailUser = yield prisma_1.prisma.user.findUnique({
            where: { email: updateData.email },
        });
        if (existingEmailUser) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, "Email is already taken by another account");
        }
    }
    let imageUrl = user.image;
    // Handle profile image upload
    if (file) {
        // If the user already had an uploaded image on Cloudinary, delete it first
        // Cloudinary public_ids are usually returned as part of the image URL or stored.
        // Since we only store the secure_url in `image`, let's try to extract the public_id from it
        if (user.image && user.image.includes("cloudinary.com")) {
            try {
                const parts = user.image.split("/");
                const filename = parts[parts.length - 1];
                const publicId = filename.split(".")[0];
                // Clean up the old image
                yield (0, uploadCloudinary_1.deleteFromCloudinary)(`profile_pictures/${publicId}`);
            }
            catch (err) {
                console.error("Failed to delete old profile image:", err);
            }
        }
        // Upload new image
        const uploadResult = yield (0, uploadCloudinary_1.uploadBufferToCloudinary)(file.buffer, "profile_pictures");
        imageUrl = uploadResult.secure_url;
    }
    const updatedUser = yield prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            name: updateData.name,
            email: updateData.email,
            location: updateData.location,
            phone: updateData.phone,
            image: imageUrl,
            fcmToken: updateData.fcmToken,
        },
    });
    // Exclude password from the returned object for security
    const { password } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
    return userWithoutPassword;
});
const changePassword = (userId, data, clientInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword } = data;
    if (!oldPassword || !newPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Both old password and new password are required");
    }
    const user = yield prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    // If user signed up via social login (Google/Apple) and hasn't set a password yet
    if (!user.password) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This account was created via social login and does not have a password. Please log in using Google or Apple.");
    }
    // Compare old password with the hashed password in database
    const isPasswordMatched = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Old password does not match");
    }
    // Hash new password and update
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
    yield prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
        },
    });
    const device = (0, deviceParser_1.getDeviceInfo)(clientInfo === null || clientInfo === void 0 ? void 0 : clientInfo.userAgent);
    yield (0, changePasswordSuccess_1.changePasswordSuccessTemplate)({
        userName: user.name,
        email: user.email,
        changedAt: new Date().toLocaleString("en-BD", {
            timeZone: "Asia/Dhaka",
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        }),
        ipAddress: clientInfo === null || clientInfo === void 0 ? void 0 : clientInfo.ipAddress,
        device,
    });
    return { message: "Password changed successfully" };
});
const downloadMyData = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: {
            journals: true,
            moods: true,
            manifestations: true,
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    // Exclude sensitive information like passwords and private session tokens
    const { password, forgetPasswordToken, forgetPasswordTokenExpires, otp, otpExpiry } = user, safeUserData = __rest(user, ["password", "forgetPasswordToken", "forgetPasswordTokenExpires", "otp", "otpExpiry"]);
    return safeUserData;
});
const deleteAccount = (userId, clientInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: {
            journals: true,
            manifestations: true,
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    // Extract user details before deleting the record
    const userName = user.name;
    const email = user.email;
    // 1. Delete user's profile image from Cloudinary if it exists
    if (user.image && user.image.includes("cloudinary.com")) {
        try {
            const parts = user.image.split("/");
            const filename = parts[parts.length - 1];
            const publicId = filename.split(".")[0];
            yield (0, uploadCloudinary_1.deleteFromCloudinary)(`profile_pictures/${publicId}`);
        }
        catch (err) {
            console.error("Failed to delete user profile picture from Cloudinary:", err);
        }
    }
    // 2. Delete all manifestation images from Cloudinary
    for (const manifestation of user.manifestations) {
        if (manifestation.imageKey) {
            try {
                yield (0, uploadCloudinary_1.deleteFromCloudinary)(manifestation.imageKey);
            }
            catch (err) {
                console.error(`Failed to delete manifestation image ${manifestation.imageKey}:`, err);
            }
        }
    }
    // 3. Delete all journal images from Cloudinary
    for (const journal of user.journals) {
        if (journal.imageKey) {
            try {
                yield (0, uploadCloudinary_1.deleteFromCloudinary)(journal.imageKey);
            }
            catch (err) {
                console.error(`Failed to delete journal image ${journal.imageKey}:`, err);
            }
        }
    }
    // 4. Delete the User. Cascade delete automatically deletes moods, manifestations, and journals in MongoDB.
    yield prisma_1.prisma.user.delete({
        where: { id: userId },
    });
    // 5. Send confirmation email
    try {
        const device = (0, deviceParser_1.getDeviceInfo)(clientInfo === null || clientInfo === void 0 ? void 0 : clientInfo.userAgent);
        const deletedAt = new Date().toLocaleString("en-BD", {
            timeZone: "Asia/Dhaka",
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
        yield (0, deleteAccount_1.deleteAccountPermanentTemplate)({
            userName,
            email,
            deletedAt,
            ipAddress: clientInfo === null || clientInfo === void 0 ? void 0 : clientInfo.ipAddress,
            device,
        });
    }
    catch (err) {
        console.error("Failed to send delete account confirmation email:", err);
    }
    return { message: "Account and all associated data deleted successfully" };
});
const updatePrivacySettings = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const updatedUser = yield prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            personalizationEnabled: data.personalizationEnabled,
            analyticsEnabled: data.analyticsEnabled,
            crashReportsEnabled: data.crashReportsEnabled,
        },
    });
    const { password } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
    return userWithoutPassword;
});
const updateFcmToken = (userId, fcmToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const updatedUser = yield prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            fcmToken,
        },
    });
    const { password } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
    return userWithoutPassword;
});
exports.UserService = {
    updateProfile,
    changePassword,
    downloadMyData,
    deleteAccount,
    updatePrivacySettings,
    updateFcmToken,
};
