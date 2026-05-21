import { prisma } from '../../lib/prisma';
import { deleteFromCloudinary, uploadBufferToCloudinary } from '../../utils/uploadCloudinary';

const createManifestation = async (userId: string, data: any, file?: Express.Multer.File) => {
  let imageUrl = null;
  let imageKey = null;

  if (file) {
    const uploadedImage = await uploadBufferToCloudinary(file.buffer, 'manifestations');
    console.log(uploadedImage)
    imageUrl = uploadedImage?.secure_url;
    imageKey = uploadedImage?.public_id;
  }

  const manifestationData = typeof data.data === 'string' ? JSON.parse(data.data) : data;

  return await prisma.manifestation.create({
    data: {
      userId,
      ...manifestationData,
      imageUrl,
      imageKey,
    },
  });
};

const getMyManifestations = async (userId: string) => {
  return await prisma.manifestation.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const getManifestationById = async (userId: string, manifestationId: string) => {
  return await prisma.manifestation.findFirst({
    where: {
      id: manifestationId,
      userId,
    },
  });
};

const updateManifestation = async (userId: string, manifestationId: string, data: any, file?: Express.Multer.File) => {
  const existingManifestation = await prisma.manifestation.findFirst({
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
      await deleteFromCloudinary(existingManifestation.imageKey);
    }
    const uploadedImage = await uploadBufferToCloudinary(file.buffer, 'manifestations');
    imageUrl = uploadedImage.secure_url;
    imageKey = uploadedImage.public_id;
  }

  const manifestationData = typeof data.data === 'string' ? JSON.parse(data.data) : data;

  return await prisma.manifestation.update({
    where: {
      id: manifestationId,
      userId,
    },
    data: {
      ...manifestationData,
      imageUrl,
      imageKey,
    },
  });
};

const deleteManifestation = async (userId: string, manifestationId: string) => {
  const existingManifestation = await prisma.manifestation.findFirst({
    where: {
      id: manifestationId,
      userId,
    },
  });

  if (existingManifestation?.imageKey) {
    await deleteFromCloudinary(existingManifestation.imageKey);
  }

  return await prisma.manifestation.delete({
    where: {
      id: manifestationId,
      userId,
    },
  });
};

export const ManifestationService = {
  createManifestation,
  getMyManifestations,
  getManifestationById,
  updateManifestation,
  deleteManifestation,
};
