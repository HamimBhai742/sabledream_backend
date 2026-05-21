import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ManifestationService } from './manifestation.services';
import catchAsyncFn from '../../utils/catchAsyncFn';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../error/AppError';

const createManifestation = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  const result = await ManifestationService.createManifestation(userId, req.body, req.file);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Manifestation created successfully',
    data: result,
  });
});

const getMyManifestations = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  const result = await ManifestationService.getMyManifestations(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Manifestations retrieved successfully',
    data: result,
  });
});

const getManifestationById = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { manifestationId } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  const result = await ManifestationService.getManifestationById(userId, manifestationId as string);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Manifestation not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Manifestation retrieved successfully',
    data: result,
  });
});

const updateManifestation = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { manifestationId } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  const result = await ManifestationService.updateManifestation(userId, manifestationId as string, req.body, req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Manifestation updated successfully',
    data: result,
  });
});

const deleteManifestation = catchAsyncFn(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { manifestationId } = req.params;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  await ManifestationService.deleteManifestation(userId, manifestationId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Manifestation deleted successfully',
    data: null,
  });
});

export const ManifestationController = {
  createManifestation,
  getMyManifestations,
  getManifestationById,
  updateManifestation,
  deleteManifestation,
};
