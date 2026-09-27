import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { requireAdmin } from '../middleware/auth';

import * as settingController from '../controllers/settingController';

export const adminRouter = Router();

// Protect all admin endpoints with admin verification
adminRouter.use(requireAdmin);

adminRouter.get('/stats', adminController.getDashboardStats);
adminRouter.get('/settings', settingController.getAdminSettings);
adminRouter.put('/settings', settingController.updateAdminSettings);
adminRouter.post('/upload', adminController.uploadMedia);
adminRouter.get('/contact-queries', adminController.getContactQueries);
adminRouter.get('/subscribers', adminController.getSubscribers);
