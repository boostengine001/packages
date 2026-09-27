import { Request, Response } from 'express';
import { Deal } from '../models';
import { isDbConnected } from '../db';

const DEFAULT_DEALS = [
  {
    _id: 'deal_1',
    productId: 'prod_1',
    productTitle: 'Cyberpunk Heavyweight 450 GSM Hoodie',
    productImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    originalPrice: 3999,
    dealPrice: 1999,
    discountPercentage: 50,
    quotaUnits: 50,
    claimedUnits: 34,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 48 * 3600000).toISOString(),
    status: 'ACTIVE',
    isActive: true,
  },
  {
    _id: 'deal_2',
    productId: 'prod_2',
    productTitle: 'Acid Wash Vintage Boxy Tee',
    productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    originalPrice: 1799,
    dealPrice: 999,
    discountPercentage: 44,
    quotaUnits: 100,
    claimedUnits: 81,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 24 * 3600000).toISOString(),
    status: 'ACTIVE',
    isActive: true,
  },
];

export const getDeals = async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const deals = await Deal.find({
        isActive: true,
        endTime: { $gte: new Date() },
      })
        .sort({ createdAt: -1 })
        .lean();

      if (deals.length > 0) {
        return res.json({ success: true, count: deals.length, deals });
      }
    }

    return res.json({ success: true, count: DEFAULT_DEALS.length, deals: DEFAULT_DEALS });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createDeal = async (req: Request, res: Response) => {
  try {
    const { productId, productTitle, productImage, originalPrice, dealPrice, endTime, quotaUnits } = req.body;

    if (!productId || !productTitle || !dealPrice || !endTime) {
      return res.status(400).json({ success: false, error: 'productId, productTitle, dealPrice, and endTime are required' });
    }

    const discountPercentage = originalPrice ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100) : 0;

    if (isDbConnected()) {
      const created = await Deal.create({
        productId,
        productTitle,
        productImage: productImage || '',
        originalPrice: Number(originalPrice || dealPrice),
        dealPrice: Number(dealPrice),
        discountPercentage,
        quotaUnits: Number(quotaUnits || 100),
        claimedUnits: 0,
        startTime: new Date(),
        endTime: new Date(endTime),
        status: 'ACTIVE',
        isActive: true,
      });

      return res.status(201).json({ success: true, deal: created });
    }

    const newDeal = {
      _id: 'deal_' + (DEFAULT_DEALS.length + 1),
      productId,
      productTitle,
      productImage: productImage || '',
      originalPrice: Number(originalPrice || dealPrice),
      dealPrice: Number(dealPrice),
      discountPercentage,
      quotaUnits: Number(quotaUnits || 100),
      claimedUnits: 0,
      startTime: new Date().toISOString(),
      endTime: new Date(endTime).toISOString(),
      status: 'ACTIVE',
      isActive: true,
    };
    DEFAULT_DEALS.push(newDeal);

    return res.status(201).json({ success: true, deal: newDeal });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteDeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await Deal.findByIdAndDelete(id);
    }
    return res.json({ success: true, message: 'Deal deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
