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
exports.ManifestationController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const manifestation_services_1 = require("./manifestation.services");
const catchAsyncFn_1 = __importDefault(require("../../utils/catchAsyncFn"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const createManifestation = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized');
    }
    const result = yield manifestation_services_1.ManifestationService.createManifestation(userId, req.body, req.file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Manifestation created successfully',
        data: result,
    });
}));
const getMyManifestations = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized');
    }
    const result = yield manifestation_services_1.ManifestationService.getMyManifestations(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Manifestations retrieved successfully',
        data: result,
    });
}));
const getManifestationById = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { manifestationId } = req.params;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized');
    }
    const result = yield manifestation_services_1.ManifestationService.getManifestationById(userId, manifestationId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Manifestation not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Manifestation retrieved successfully',
        data: result,
    });
}));
const updateManifestation = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { manifestationId } = req.params;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized');
    }
    const result = yield manifestation_services_1.ManifestationService.updateManifestation(userId, manifestationId, req.body, req.file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Manifestation updated successfully',
        data: result,
    });
}));
const deleteManifestation = (0, catchAsyncFn_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { manifestationId } = req.params;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized');
    }
    yield manifestation_services_1.ManifestationService.deleteManifestation(userId, manifestationId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Manifestation deleted successfully',
        data: null,
    });
}));
exports.ManifestationController = {
    createManifestation,
    getMyManifestations,
    getManifestationById,
    updateManifestation,
    deleteManifestation,
};
