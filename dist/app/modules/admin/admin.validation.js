"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminValidation = void 0;
const zod_1 = require("zod");
const updateUserStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["active", "inactive", "blocked"]),
});
const updateUserRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(["user", "admin"]),
});
exports.AdminValidation = {
    updateUserStatusSchema,
    updateUserRoleSchema,
};
