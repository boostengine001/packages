import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { requireAdmin } from '../middleware/auth';
import { validate, rules } from '../middleware/validator';

export const notificationsRouter = Router();

// Validate WhatsApp notification payload
notificationsRouter.post(
  '/whatsapp',
  requireAdmin,
  validate({
    body: {
      phone: [rules.required('Phone number'), rules.indianPhone('Phone number')],
      message: [rules.required('Notification message')],
    },
  }),
  notificationController.sendWhatsAppNotification
);
