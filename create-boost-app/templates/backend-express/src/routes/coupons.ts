import { Router } from 'express';
import * as couponController from '../controllers/couponController';
import { requireAdmin } from '../middleware/auth';
import { validate, rules } from '../middleware/validator';

export const couponsRouter = Router();

// Public coupon validation at checkout with body validation
couponsRouter.post(
  '/validate',
  validate({
    body: {
      code: [rules.required('Coupon code'), rules.string('Coupon code')],
    },
  }),
  couponController.validateCoupon
);

// Available public coupons
couponsRouter.get('/', couponController.getCoupons);

// Admin-only management
couponsRouter.post(
  '/',
  requireAdmin,
  validate({
    body: {
      code: [rules.required('Coupon code')],
      value: [rules.required('Coupon discount value'), rules.positiveNumber('Discount value')],
    },
  }),
  couponController.createCoupon
);

couponsRouter.delete('/:id', requireAdmin, couponController.deleteCoupon);
