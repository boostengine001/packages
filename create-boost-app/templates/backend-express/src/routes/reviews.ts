import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { leadRateLimiter } from '../middleware/rateLimiter';
import { validate, rules } from '../middleware/validator';

export const reviewsRouter = Router();

// Public reviews lookup with query validation
reviewsRouter.get(
  '/',
  validate({
    query: {
      productId: [rules.required('productId')],
    },
  }),
  reviewController.getReviews
);

// Rate-limited customer review submissions with body validation
reviewsRouter.post(
  '/',
  leadRateLimiter,
  validate({
    body: {
      productId: [rules.required('productId')],
      author: [rules.required('Author name'), rules.string('Author name')],
      rating: [rules.required('Rating'), rules.number('Rating')],
      comment: [rules.required('Comment'), rules.minLength(3, 'Comment')],
    },
  }),
  reviewController.createReview
);
