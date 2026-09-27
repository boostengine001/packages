import { Router } from 'express';
import * as shippingController from '../controllers/shippingController';
import { validate, rules } from '../middleware/validator';

export const shippingRouter = Router();

// Validate 6-digit Indian PIN code param
shippingRouter.get(
  '/pincode/:pincode',
  validate({
    params: {
      pincode: [rules.required('Pincode'), rules.pincode('Pincode')],
    },
  }),
  shippingController.getPincodeDetails
);

shippingRouter.post('/create-shipment', shippingController.createShipment);

// Validate AWB param
shippingRouter.get(
  '/track/:awb',
  validate({
    params: {
      awb: [rules.required('AWB Number'), rules.minLength(4, 'AWB Number')],
    },
  }),
  shippingController.trackShipment
);
