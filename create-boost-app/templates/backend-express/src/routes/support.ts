import { Router } from 'express';
import * as supportController from '../controllers/supportController';
import { leadRateLimiter } from '../middleware/rateLimiter';
import { validate, rules } from '../middleware/validator';

export const supportRouter = Router();

// Rate-limited public lead & contact submissions with body validation
supportRouter.post(
  '/contact',
  leadRateLimiter,
  validate({
    body: {
      name: [rules.required('Name'), rules.string('Name')],
      email: [rules.required('Email'), rules.email('Email')],
      message: [rules.required('Message'), rules.minLength(5, 'Message')],
    },
  }),
  supportController.submitContactForm
);

supportRouter.post(
  '/newsletter/subscribe',
  leadRateLimiter,
  validate({
    body: {
      email: [rules.required('Email'), rules.email('Email')],
    },
  }),
  supportController.subscribeNewsletter
);

supportRouter.post('/warranty/register', leadRateLimiter, supportController.registerWarranty);
supportRouter.post('/warranty/claim', leadRateLimiter, supportController.claimWarranty);

// Public policy information with param validation
supportRouter.get(
  '/policies/:type',
  validate({
    params: {
      type: [rules.required('Policy type'), rules.inArray(['privacy', 'terms', 'refund', 'shipping'], 'Policy type')],
    },
  }),
  supportController.getPolicy
);
