import { Router } from 'express';
import { ManifestationController } from './manifestation.controller';
import checkAuth from '../../middleware/checkAuth';
import { upload } from '../../middleware/upload';

const router = Router();

router.post(
  '/create',
  checkAuth('user', 'admin'),
  upload.single('file'),
  ManifestationController.createManifestation
);

router.get(
  '/',
  checkAuth('user', 'admin'),
  ManifestationController.getMyManifestations
);

router.get(
  '/:manifestationId',
  checkAuth('user', 'admin'),
  ManifestationController.getManifestationById
);

router.patch(
  '/:manifestationId',
  checkAuth('user', 'admin'),
  upload.single('file'),
  ManifestationController.updateManifestation
);

router.delete(
  '/:manifestationId',
  checkAuth('user', 'admin'),
  ManifestationController.deleteManifestation
);

export const ManifestationRoutes = router;
