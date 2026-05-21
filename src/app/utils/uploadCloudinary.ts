import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/coundinary";

export const uploadBufferToCloudinary = async (
  fileBuffer: Buffer,
  folder = "journals"
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};