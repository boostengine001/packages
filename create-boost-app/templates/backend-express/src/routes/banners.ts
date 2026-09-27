import { Router } from 'express';
import * as bannerController from '../controllers/bannerController';
import { requireAdmin } from '../middleware/auth';

export const bannersRouter = Router();

// Public banner list
bannersRouter.get('/', bannerController.getBanners);

// Admin-only management
bannersRouter.post('/', requireAdmin, bannerController.createBanner);
bannersRouter.put('/:id', requireAdmin, bannerController.updateBanner);
bannersRouter.delete('/:id', requireAdmin, bannerController.deleteBanner);
