import { Router } from 'express';
import * as abandonedCheckoutController from '../controllers/abandonedCheckoutController';
import { requireAdmin } from '../middleware/auth';
import { leadRateLimiter } from '../middleware/rateLimiter';

export const abandonedCheckoutRouter = Router();

// Rate-limited checkout recovery recording from client store
abandonedCheckoutRouter.post('/', leadRateLimiter, abandonedCheckoutController.recordAbandonedCheckout);

// Admin-only retrieval of customer leads and carts
abandonedCheckoutRouter.get('/', requireAdmin, abandonedCheckoutController.getAbandonedCheckouts);
