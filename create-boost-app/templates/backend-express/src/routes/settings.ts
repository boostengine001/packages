import { Router } from 'express';
import * as settingController from '../controllers/settingController';
import { requireAdmin } from '../middleware/auth';

export const settingsRouter = Router();

// Public store branding and policy settings
settingsRouter.get('/', settingController.getPublicSettings);

// Protected admin settings (includes payment gateway keys and admin configs)
settingsRouter.get('/admin', requireAdmin, settingController.getAdminSettings);
settingsRouter.put('/admin', requireAdmin, settingController.updateAdminSettings);
