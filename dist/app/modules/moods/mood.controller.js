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
exports.MoodController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const moods_services_1 = require("./moods.services");
const catchAsyncFn_1 = __importDefault(require("../../utils/catchAsyncFn"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const createOrUpdateMood = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized');
    }
    const result = yield moods_services_1.MoodService.createOrUpdateMood(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Mood tracked successfully',
        data: result,
    });
}));
const getMoodByDate = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { date } = req.query;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized');
    }
    if (!date) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Date is required');
    }
    const result = yield moods_services_1.MoodService.getMoodByDate(userId, date);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Mood retrieved successfully',
        data: result,
    });
}));
const getMoodsByDateRange = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { startDate, endDate, year, month } = req.query;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized');
    }
    let result;
    if (year && month) {
        result = yield moods_services_1.MoodService.getMoodsByMonth(userId, parseInt(year), parseInt(month));
    }
    else if (startDate && endDate) {
        result = yield moods_services_1.MoodService.getMoodsByDateRange(userId, startDate, endDate);
    }
    else {
        // Default to current month if no parameters provided
        const now = new Date();
        result = yield moods_services_1.MoodService.getMoodsByMonth(userId, now.getFullYear(), now.getMonth() + 1);
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Moods retrieved successfully',
        data: result,
    });
}));
const getMoodHistory = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized');
    }
    const result = yield moods_services_1.MoodService.getMoodHistory(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Mood history retrieved successfully',
        data: result,
    });
}));
exports.MoodController = {
    createOrUpdateMood,
    getMoodByDate,
    getMoodsByDateRange,
    getMoodHistory,
};
