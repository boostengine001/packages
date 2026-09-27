import { Request, Response } from 'express';
import { AbandonedCheckout } from '../models';
import { isDbConnected } from '../db';

export const recordAbandonedCheckout = async (req: Request, res: Response) => {
  try {
    const { email, phone, customerName, items, totalAmount } = req.body;

    if (!items || !totalAmount) {
      return res.status(400).json({ success: false, error: 'Items and total amount are required' });
    }

    if (isDbConnected()) {
      const recorded = await AbandonedCheckout.create({
        email,
        phone,
        customerName,
        items,
        totalAmount,
        recovered: false,
        recoveryEmailSent: false,
      });

      return res.status(201).json({ success: true, id: recorded._id });
    }

    return res.status(201).json({ success: true, id: 'ab_' + Date.now() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAbandonedCheckouts = async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const list = await AbandonedCheckout.find({ recovered: false }).sort({ createdAt: -1 }).limit(50).lean();
      return res.json({ success: true, count: list.length, data: list });
    }
    return res.json({ success: true, count: 0, data: [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
