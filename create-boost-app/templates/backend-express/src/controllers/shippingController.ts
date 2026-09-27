import { Request, Response } from 'express';
import { lookupPincode } from '../utils/pincodes';

export const getPincodeDetails = (req: Request, res: Response) => {
  const { pincode } = req.params;
  const clean = (pincode || '').replace(/\D/g, '');

  if (clean.length !== 6) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid 6-digit Indian PIN code.',
    });
  }

  const result = lookupPincode(clean);
  return res.json({ success: true, ...result });
};

export const createShipment = (req: Request, res: Response) => {
  const { orderId } = req.body;
  const awb = 'DEL' + Math.floor(10000000 + Math.random() * 90000000);

  return res.status(201).json({
    success: true,
    shipmentId: 'ship_' + Date.now(),
    orderId: orderId || 'ORD-TEST',
    awbCode: awb,
    courierName: 'Delhivery Surface',
    status: 'MANIFESTED',
    labelUrl: `/api/shipping/label/${awb}.pdf`,
    message: 'Shipment created and scheduled for next courier pickup window.',
  });
};

export const trackShipment = (req: Request, res: Response) => {
  const { awb } = req.params;

  return res.json({
    success: true,
    awb,
    courier: 'Delhivery Surface',
    currentStatus: 'IN_TRANSIT',
    estimatedDeliveryDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    timeline: [
      { status: 'Order Placed & Confirmed', location: 'Warehouse', time: new Date(Date.now() - 36 * 3600000).toISOString() },
      { status: 'Packed & Manifest Generated', location: 'Origin Sorting Center', time: new Date(Date.now() - 24 * 3600000).toISOString() },
      { status: 'Picked Up by Courier', location: 'Delhi Hub', time: new Date(Date.now() - 16 * 3600000).toISOString() },
      { status: 'In Transit to Destination Hub', location: 'National Highway Transit', time: new Date(Date.now() - 4 * 3600000).toISOString() },
      { status: 'Out for Delivery', location: 'Local Destination Delivery Center', time: null },
    ],
  });
};
