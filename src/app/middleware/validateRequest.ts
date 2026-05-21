import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject, ZodRawShape } from "zod";

const validateRequest = (schema: ZodObject<ZodRawShape>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let bodyData = req.body;

      if (!bodyData) {
        return res.status(400).json({
          success: false,
          message: "Request body is missing",
          errorMessages: [
            {
              path: "body",
              message:
                "Request body is required. For JSON use express.json(), for image upload use multer before validateRequest.",
            },
          ],
        });
      }

      if (req.body?.data) {
        bodyData =
          typeof req.body.data === "string"
            ? JSON.parse(req.body.data)
            : req.body.data;
      }

      const parsedData = await schema.parseAsync(bodyData);

      req.body = parsedData;

      next();
    } catch (error) {
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

      if (error instanceof ZodError) {
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
  };
};

export default validateRequest;