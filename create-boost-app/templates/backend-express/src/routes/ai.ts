import { Router } from 'express';
import * as aiController from '../controllers/aiController';
import { validate, rules } from '../middleware/validator';

export const aiRouter = Router();

// Validate prompt/message for AI shopping assistant
aiRouter.post(
  '/assistant',
  (req, res, next) => {
    const input = req.body?.prompt || req.body?.message;
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: [{ field: 'prompt', message: 'Prompt or message is required' }],
      });
    }
    req.body.message = input;
    req.body.prompt = input;
    next();
  },
  aiController.handleAiShoppingAssistant
);
