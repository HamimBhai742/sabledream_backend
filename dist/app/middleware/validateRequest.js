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
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            let bodyData = req.body;
            if (!bodyData) {
                return res.status(400).json({
                    success: false,
                    message: "Request body is missing",
                    errorMessages: [
                        {
                            path: "body",
                            message: "Request body is required. For JSON use express.json(), for image upload use multer before validateRequest.",
                        },
                    ],
                });
            }
            if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.data) {
                bodyData =
                    typeof req.body.data === "string"
                        ? JSON.parse(req.body.data)
                        : req.body.data;
            }
            const parsedData = yield schema.parseAsync(bodyData);
            req.body = parsedData;
            next();
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid JSON format in data field",
                    errorMessages: [
                        {
                            path: "data",
                            message: "Data must be a valid JSON string",
                        },
                    ],
                });
            }
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errorMessages: error.issues.map((issue) => ({
                        path: issue.path.join("."),
                        message: issue.message,
                    })),
                });
            }
            next(error);
        }
    });
};
exports.default = validateRequest;
