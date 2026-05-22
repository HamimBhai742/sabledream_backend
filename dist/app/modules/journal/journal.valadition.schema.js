"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategorySchema = exports.updateJournalSchema = exports.createJournalSchema = void 0;
const zod_1 = require("zod");
exports.createJournalSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(120),
    prompt: zod_1.z.string().max(300).optional(),
    content: zod_1.z.string().max(10000).optional(),
    mood: zod_1.z
        .enum(["HAPPY", "SAD", "CALM", "GRATEFUL", "ANXIOUS", "EXCITED", "NEUTRAL"])
        .optional(),
    status: zod_1.z.enum(["DRAFT", "PUBLISHED"]).optional(),
    categoryIds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateJournalSchema = exports.createJournalSchema.partial().extend({
    isFavorite: zod_1.z.boolean().optional(),
    isArchived: zod_1.z.boolean().optional(),
});
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Category name is required").max(50),
});
