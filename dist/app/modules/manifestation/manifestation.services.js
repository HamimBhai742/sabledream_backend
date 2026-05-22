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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestationService = void 0;
const prisma_1 = require("../../lib/prisma");
const uploadCloudinary_1 = require("../../utils/uploadCloudinary");
const createManifestation = (userId, data, file) => __awaiter(void 0, void 0, void 0, function* () {
    let imageUrl = null;
    let imageKey = null;
    if (file) {
        const uploadedImage = yield (0, uploadCloudinary_1.uploadBufferToCloudinary)(file.buffer, 'manifestations');
        console.log(uploadedImage);
        imageUrl = uploadedImage === null || uploadedImage === void 0 ? void 0 : uploadedImage.secure_url;
        imageKey = uploadedImage === null || uploadedImage === void 0 ? void 0 : uploadedImage.public_id;
    }
    const manifestationData = typeof data.data === 'string' ? JSON.parse(data.data) : data;
    return yield prisma_1.prisma.manifestation.create({
        data: Object.assign(Object.assign({ userId }, manifestationData), { imageUrl,
            imageKey }),
    });
});
const getMyManifestations = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.manifestation.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
});
const getManifestationById = (userId, manifestationId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.manifestation.findFirst({
        where: {
            id: manifestationId,
            userId,
        },
    });
});
const updateManifestation = (userId, manifestationId, data, file) => __awaiter(void 0, void 0, void 0, function* () {
    const existingManifestation = yield prisma_1.prisma.manifestation.findFirst({
        where: {
            id: manifestationId,
            userId,
        },
    });
    if (!existingManifestation) {
        throw new Error('Manifestation not found');
    }
    let imageUrl = existingManifestation.imageUrl;
    let imageKey = existingManifestation.imageKey;
    if (file) {
        if (existingManifestation.imageKey) {
            yield (0, uploadCloudinary_1.deleteFromCloudinary)(existingManifestation.imageKey);
        }
        const uploadedImage = yield (0, uploadCloudinary_1.uploadBufferToCloudinary)(file.buffer, 'manifestations');
        imageUrl = uploadedImage.secure_url;
        imageKey = uploadedImage.public_id;
    }
    const manifestationData = typeof data.data === 'string' ? JSON.parse(data.data) : data;
    return yield prisma_1.prisma.manifestation.update({
        where: {
            id: manifestationId,
            userId,
        },
        data: Object.assign(Object.assign({}, manifestationData), { imageUrl,
            imageKey }),
    });
});
const deleteManifestation = (userId, manifestationId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingManifestation = yield prisma_1.prisma.manifestation.findFirst({
        where: {
            id: manifestationId,
            userId,
        },
    });
    if (existingManifestation === null || existingManifestation === void 0 ? void 0 : existingManifestation.imageKey) {
        yield (0, uploadCloudinary_1.deleteFromCloudinary)(existingManifestation.imageKey);
    }
    return yield prisma_1.prisma.manifestation.delete({
        where: {
            id: manifestationId,
            userId,
        },
    });
});
exports.ManifestationService = {
    createManifestation,
    getMyManifestations,
    getManifestationById,
    updateManifestation,
    deleteManifestation,
};
