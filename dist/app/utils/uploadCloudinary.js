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
exports.deleteFromCloudinary = exports.uploadBufferToCloudinary = void 0;
const coundinary_1 = __importDefault(require("../config/coundinary"));
const uploadBufferToCloudinary = (fileBuffer_1, ...args_1) => __awaiter(void 0, [fileBuffer_1, ...args_1], void 0, function* (fileBuffer, folder = "journals") {
    return new Promise((resolve, reject) => {
        const uploadStream = coundinary_1.default.uploader.upload_stream({
            folder,
            resource_type: "image",
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            if (!result) {
                reject(new Error("Cloudinary upload failed"));
                return;
            }
            resolve(result);
        });
        uploadStream.end(fileBuffer);
    });
});
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
const deleteFromCloudinary = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    return coundinary_1.default.uploader.destroy(publicId);
});
exports.deleteFromCloudinary = deleteFromCloudinary;
