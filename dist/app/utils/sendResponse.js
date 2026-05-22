"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, payload) => {
    const responseData = {
        statusCode: payload.statusCode,
        success: payload.success,
        message: payload.message,
    };
    if (payload.meta) {
        responseData.meta = payload.meta;
    }
    if (payload.data !== undefined) {
        responseData.data = payload.data;
    }
    return res.status(payload.statusCode).json(responseData);
};
exports.default = sendResponse;
