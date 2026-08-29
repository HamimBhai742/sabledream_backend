import imagekit from "../config/imagekit";
import { toFile } from "@imagekit/nodejs";

export const uploadBufferToImageKit = async (
  fileBuffer: Buffer,
  folder = "journals"
) => {
  const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

  return imagekit.files.upload({
    file: await toFile(fileBuffer, fileName),
    fileName,
    folder: `/${folder}`,
  });
};

export const deleteFromImageKit = async (fileIdOrUrl: string) => {
  if (!fileIdOrUrl) return;

  // If it's a URL, search for the file using the filename to retrieve its fileId
  if (fileIdOrUrl.startsWith("http")) {
    if (!fileIdOrUrl.includes("imagekit.io")) {
      console.warn(`Skipping deletion for non-ImageKit URL: ${fileIdOrUrl}`);
      return;
    }
    const parts = fileIdOrUrl.split("/");
    const fileName = parts[parts.length - 1];

    const files = await imagekit.assets.list({
      searchQuery: `name = "${fileName}"`,
    });

    if (files && files.length > 0) {
      const file = files[0];
      if (file && "fileId" in file && file.fileId) {
        await imagekit.files.delete(file.fileId);
      }
    } else {
      console.warn(`Could not find ImageKit file with name: ${fileName}`);
    }
  } else {
    // It is a direct fileId
    await imagekit.files.delete(fileIdOrUrl);
  }
};
