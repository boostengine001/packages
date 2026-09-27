import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { requireAdmin, optionalAuth } from '../middleware/auth';
import { validate, rules } from '../middleware/validator';

export const ordersRouter = Router();

// Order list (requires phone query for customer lookup or admin auth for full list)
ordersRouter.get('/', optionalAuth, orderController.getOrders);

// Create order with body validation
ordersRouter.post(
  '/',
  validate({
    body: {
      customer: [rules.required('Customer details')],
      items: [rules.required('Order items'), rules.arrayNotEmpty('Order items')],
    },
  }),
  orderController.createOrder
);

// Track order with body validation
ordersRouter.post(
  '/track',
  validate({
    body: {
      orderId: [rules.required('Order ID')],
      phone: [rules.required('Phone number')],
    },
  }),
  orderController.trackOrder
);

// Order lookup with param validation
ordersRouter.get(
  '/:orderId',
  validate({
    params: {
      orderId: [rules.required('Order ID')],
    },
  }),
  orderController.getOrderById
);

// Admin-only order status update with param validation
ordersRouter.patch(
  '/:orderId',
  requireAdmin,
  validate({
    params: {
      orderId: [rules.required('Order ID')],
    },
  }),
  orderController.updateOrderStatus
);
