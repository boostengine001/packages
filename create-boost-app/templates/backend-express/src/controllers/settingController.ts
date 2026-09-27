import { Request, Response } from 'express';
import { Setting } from '../models';
import { isDbConnected } from '../db';

const DEFAULT_SETTINGS = {
  storeName: process.env.BUSINESS_NAME || 'Boost D2C Store',
  contactEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
  storeAddress: '123 Fashion Street, New Delhi, DL 110001',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  theme: 'dark',
  font: 'inter',
  primaryColor: '#6366f1',
  primaryColorDark: '#4f46e5',
  logoUrl: '',
  footerDescription: 'Modern Direct-to-Consumer digital storefront powered by Boost Engine.',
  privacyPolicy: 'We value your privacy and only process essential order fulfillment data.',
  termsAndConditions: 'All orders processed in accordance with Indian e-commerce standards.',
  refundPolicy: '7-day hassle-free doorstep replacement or exchange for defective products.',
  shippingPolicy: 'Dispatched within 24 hours. Delivery in 2-4 business days across India.',
  isCodEnabled: true,
  isRazorpayEnabled: true,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  isPhonePeEnabled: false,
  isCashfreeEnabled: false,
  freeShippingThreshold: 999,
  defaultShippingFee: 79,
  socials: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
  },
};

let MEMORY_SETTINGS = { ...DEFAULT_SETTINGS };

export const getPublicSettings = async (_req: Request, res: Response) => {
  try {
    let settings = MEMORY_SETTINGS;

    if (isDbConnected()) {
      const dbSettings = await Setting.findOne().lean();
      if (dbSettings) {
        settings = { ...MEMORY_SETTINGS, ...dbSettings };
      }
    }

    const {
      razorpayKeySecret,
      phonepeSaltKey,
      cashfreeSecretKey,
      ...publicSettings
    } = settings as any;

    return res.json({
      success: true,
      settings: publicSettings,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAdminSettings = async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      let dbSettings = await Setting.findOne().lean();
      if (!dbSettings) {
        dbSettings = await Setting.create(DEFAULT_SETTINGS);
      }
      return res.json({ success: true, settings: dbSettings });
    }
    return res.json({ success: true, settings: MEMORY_SETTINGS });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateAdminSettings = async (req: Request, res: Response) => {
  try {
    const updateData = req.body;

    if (isDbConnected()) {
      const updated = await Setting.findOneAndUpdate({}, updateData, {
        new: true,
        upsert: true,
      });
      return res.json({ success: true, message: 'Settings saved to database', settings: updated });
    }

    MEMORY_SETTINGS = { ...MEMORY_SETTINGS, ...updateData };
    return res.json({ success: true, message: 'Settings updated in memory', settings: MEMORY_SETTINGS });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
