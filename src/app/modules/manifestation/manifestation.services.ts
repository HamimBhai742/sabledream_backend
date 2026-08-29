import { prisma } from '../../lib/prisma';
import { deleteFromImageKit, uploadBufferToImageKit } from '../../utils/uploadImageKit';

const createManifestation = async (userId: string, data: any, file?: Express.Multer.File) => {
  let imageUrl = null;
  let imageKey = null;

  if (file) {
    const uploadedImage = await uploadBufferToImageKit(file.buffer, 'manifestations');
    imageUrl = uploadedImage?.url;
    imageKey = uploadedImage?.fileId;
  }

  const manifestationData = typeof data.data === 'string' ? JSON.parse(data.data) : data;

  return await prisma.manifestation.create({
    data: {
      userId,
      ...manifestationData,
      status: 'In process',
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
      await deleteFromImageKit(existingManifestation.imageKey);
    }
    const uploadedImage = await uploadBufferToImageKit(file.buffer, 'manifestations');
    imageUrl = uploadedImage.url || null;
    imageKey = uploadedImage.fileId || null;
  }

  const manifestationData = typeof data.data === 'string' ? JSON.parse(data.data) : data;

  let status = manifestationData.status;
  if (manifestationData.state !== undefined) {
    const stateStr = String(manifestationData.state).toLowerCase().trim();
    if (stateStr === 'manifestation has fully arrived' || stateStr === 'manifestation has fully arrived successfully') {
      status = 'Done';
    } else {
      status = 'In process';
    }
  }

  return await prisma.manifestation.update({
    where: {
      id: manifestationId,
      userId,
    },
    data: {
      ...manifestationData,
      ...(status !== undefined ? { status } : {}),
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
    await deleteFromImageKit(existingManifestation.imageKey);
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
