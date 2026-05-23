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
exports.seedAdminFunction = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const seedAdminFunction = () => __awaiter(void 0, void 0, void 0, function* () {
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "";
    const name = (process.env.ADMIN_SEED_NAME || "Admin").trim() || "Admin";
    console.log(email, password);
    if (!email || !password) {
        return {
            status: "skipped",
            reason: "Missing ADMIN_SEED_EMAIL or ADMIN_SEED_PASSWORD",
        };
    }
    const existing = yield prisma_1.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, role: true },
    });
    if (existing) {
        if (existing.role !== "admin") {
            return {
                status: "skipped",
                reason: `User already exists but role is '${existing.role}' (not promoting automatically)`,
            };
        }
        return { status: "exists", adminId: existing.id, email: existing.email };
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const created = yield prisma_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            provider: "EMAIL",
            role: "admin",
            status: "active",
            isVerified: true,
        },
        select: { id: true, email: true },
    });
    return { status: "created", adminId: created.id, email: created.email };
});
exports.seedAdminFunction = seedAdminFunction;
