import { Request, Response } from 'express';
import { Coupon } from '../models';
import { isDbConnected } from '../db';

interface CouponRule {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpend?: number;
  isActive: boolean;
  expiryDate?: string;
}

const DEFAULT_COUPONS: CouponRule[] = [
  { code: 'BOOST20', type: 'percentage', value: 20, minSpend: 999, isActive: true },
  { code: 'SAVE20', type: 'percentage', value: 20, minSpend: 1499, isActive: true },
  { code: 'WELCOME10', type: 'percentage', value: 10, minSpend: 499, isActive: true },
  { code: 'FLAT200', type: 'fixed', value: 200, minSpend: 1999, isActive: true },
];

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, cartTotal = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: 'Coupon code is required.' });
    }

    const upper = String(code).trim().toUpperCase();

    if (isDbConnected()) {
      const dbCoupon = await Coupon.findOne({ code: upper, isActive: true }).lean();
      if (dbCoupon) {
        if (new Date() > new Date(dbCoupon.expiryDate)) {
          return res.status(400).json({ success: false, valid: false, error: 'Coupon has expired.' });
        }

        if (dbCoupon.minSpend && cartTotal < dbCoupon.minSpend) {
          return res.status(400).json({
            success: false,
            valid: false,
            error: `Minimum spend of ₹${dbCoupon.minSpend} required to apply this coupon.`,
          });
        }

        const discount =
          dbCoupon.type === 'percentage'
            ? Math.round(Number(cartTotal) * (dbCoupon.value / 100))
            : dbCoupon.value;

        return res.json({
          success: true,
          valid: true,
          code: dbCoupon.code,
          discountType: dbCoupon.type,
          discountValue: dbCoupon.value,
          calculatedDiscount: discount,
          message: `${dbCoupon.type === 'percentage' ? dbCoupon.value + '%' : '₹' + dbCoupon.value} discount applied!`,
        });
      }
    }

    const match = DEFAULT_COUPONS.find((c) => c.code === upper && c.isActive);
    if (!match) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Invalid coupon code. Try BOOST20 or WELCOME10.',
      });
    }

    if (match.minSpend && cartTotal < match.minSpend) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: `Minimum order value for ${match.code} is ₹${match.minSpend}.`,
      });
    }

    const discount =
      match.type === 'percentage'
        ? Math.round(Number(cartTotal) * (match.value / 100))
        : match.value;

    return res.json({
      success: true,
      valid: true,
      code: match.code,
      discountType: match.type,
      discountValue: match.value,
      calculatedDiscount: discount,
      message: `${match.value}% discount applied!`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getCoupons = async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
      if (coupons.length > 0) {
        return res.json({ success: true, count: coupons.length, coupons });
      }
    }
    return res.json({ success: true, count: DEFAULT_COUPONS.length, coupons: DEFAULT_COUPONS });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, type, value, expiryDate, minSpend, usageLimit } = req.body;
    if (!code || !value) {
      return res.status(400).json({ success: false, error: 'Code and discount value are required' });
    }

    const upper = String(code).trim().toUpperCase();

    if (isDbConnected()) {
      const created = await Coupon.create({
        code: upper,
        type: type || 'percentage',
        value: Number(value),
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 30 * 86400000),
        minSpend: minSpend ? Number(minSpend) : 0,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        isActive: true,
      });
      return res.status(201).json({ success: true, coupon: created });
    }

    const item: CouponRule = {
      code: upper,
      type: type || 'percentage',
      value: Number(value),
      minSpend: minSpend ? Number(minSpend) : 0,
      isActive: true,
    };
    DEFAULT_COUPONS.push(item);
    return res.status(201).json({ success: true, coupon: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await Coupon.findByIdAndDelete(id);
    }
    return res.json({ success: true, message: 'Coupon deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
