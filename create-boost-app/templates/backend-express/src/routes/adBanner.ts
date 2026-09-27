import { Router } from 'express';
import * as adBannerController from '../controllers/adBannerController';
import { requireAdmin } from '../middleware/auth';

export const adBannerRouter = Router();

// Public banner display
adBannerRouter.get('/', adBannerController.getAdBanner);

// Admin-only banner update
adBannerRouter.post('/', requireAdmin, adBannerController.updateAdBanner);
