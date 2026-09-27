import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { paymentRateLimiter } from '../middleware/rateLimiter';
import { validate, rules } from '../middleware/validator';

export const paymentsRouter = Router();

// Rate-limit payment order generation & validate amount
paymentsRouter.post(
  '/create-order',
  paymentRateLimiter,
  validate({
    body: {
      amount: [rules.required('Amount'), rules.positiveNumber('Amount')],
    },
  }),
  paymentController.createPaymentOrder
);

paymentsRouter.post(
  '/verify',
  validate({
    body: {
      razorpay_order_id: [rules.required('Razorpay Order ID')],
      razorpay_payment_id: [rules.required('Razorpay Payment ID')],
      razorpay_signature: [rules.required('Razorpay Signature')],
    },
  }),
  paymentController.verifyPayment
);

paymentsRouter.post('/webhook', paymentController.handlePaymentWebhook);
