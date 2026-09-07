import { prisma } from '../../lib/prisma';
import { deleteFromImageKit, uploadBufferToImageKit } from '../../utils/uploadImageKit';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { sendPushNotification } from '../../utils/sendNotification';

const notifyManifestationEvent = async (
  userId: string,
  event: 'created' | 'completed',
  manifestationTitle?: string
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    const isCreated = event === 'created';
    const title = isCreated ? 'Manifestation Saved' : 'Manifestation Arrived';
    const titleSnippet = manifestationTitle ? ` "${manifestationTitle}"` : '';
    const body = isCreated
      ? `Your manifestation${titleSnippet} has been saved. Believe in your vision. ✨`
      : `Congratulations! Your manifestation${titleSnippet} has arrived. 🎉`;

    const dataPayload = { screen: 'manifestation', event };

    if (user?.fcmToken) {
      await sendPushNotification(user.fcmToken, title, body, dataPayload, userId);
    } else {
      await prisma.notification.create({
        data: {
          userId,
          title,
          body,
          data: dataPayload,
        },
      });
    }
  } catch (err) {
    console.error(`[Manifestation] Notification error for user ${userId}:`, err);
  }
};

const createManifestation = async (userId: string, data: any, file?: Express.Multer.File) => {
  let imageUrl = null;
  let imageKey = null;

  if (file) {
    const uploadedImage = await uploadBufferToImageKit(file.buffer, 'manifestations');
    imageUrl = uploadedImage?.url;
    imageKey = uploadedImage?.fileId;
  }

  const manifestationData = typeof data.data === 'string' ? JSON.parse(data.data) : data;

  const created = await prisma.manifestation.create({
    data: {
      userId,
      ...manifestationData,
      status: 'In process',
      imageUrl,
      imageKey,
    },
  });

  await notifyManifestationEvent(userId, 'created', created.name);

  return created;
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

  const updated = await prisma.manifestation.update({
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

  const isCompletedNow = (status === 'Done' || status === 'completed') && existingManifestation.status !== 'Done' && existingManifestation.status !== 'completed';
  if (isCompletedNow) {
    await notifyManifestationEvent(userId, 'completed', updated.name || existingManifestation.name);
  }

  return updated;
};

const deleteManifestation = async (userId: string, manifestationId: string) => {
  const existingManifestation = await prisma.manifestation.findFirst({
    where: {
      id: manifestationId,
      userId,
    },
  });

  if (!existingManifestation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Manifestation not found');
  }

  if (existingManifestation.imageKey) {
    try {
      await deleteFromImageKit(existingManifestation.imageKey);
    } catch (err) {
      console.error(`[Manifestation] Failed to delete image ${existingManifestation.imageKey} from ImageKit:`, err);
    }
  }

  return await prisma.manifestation.delete({
    where: {
      id: manifestationId,
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
