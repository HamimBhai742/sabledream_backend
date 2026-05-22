"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodValidation = exports.moodValidationSchema = void 0;
const zod_1 = require("zod");
exports.moodValidationSchema = zod_1.z.object({
    energy: zod_1.z.string({
        error: 'Energy is required',
    }),
    activities: zod_1.z.array(zod_1.z.string()).min(1, 'At least one activity is required'),
    date: zod_1.z.string({
        error: 'Date is required',
    }),
});
exports.MoodValidation = {
    moodValidationSchema: exports.moodValidationSchema,
};
