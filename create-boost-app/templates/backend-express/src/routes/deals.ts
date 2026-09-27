import { Router } from 'express';
import * as dealController from '../controllers/dealController';
import { requireAdmin } from '../middleware/auth';

export const dealsRouter = Router();

// Public deal list
dealsRouter.get('/', dealController.getDeals);

// Admin-only management
dealsRouter.post('/', requireAdmin, dealController.createDeal);
dealsRouter.delete('/:id', requireAdmin, dealController.deleteDeal);
