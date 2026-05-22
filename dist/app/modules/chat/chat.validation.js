"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatValidation = exports.chatMessageSchema = void 0;
const zod_1 = require("zod");
exports.chatMessageSchema = zod_1.z.object({
    user_id: zod_1.z.string().min(1).optional(),
    message: zod_1.z.string().min(1, "message is required").max(4000),
});
exports.ChatValidation = {
    chatMessageSchema: exports.chatMessageSchema,
};
