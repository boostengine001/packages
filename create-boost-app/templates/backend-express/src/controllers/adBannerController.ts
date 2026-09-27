import { Request, Response } from 'express';
import { AdBanner } from '../models';
import { isDbConnected } from '../db';

const DEFAULT_BANNER = {
  _id: 'default_ad_banner',
  text: '🔥 Free Express Shipping across India on orders above ₹999 | Use Code: BOOST20',
  backgroundColor: '#4f46e5',
  textColor: '#ffffff',
  link: '/shop',
  isActive: true,
  showCloseButton: true,
};

let MEMORY_BANNER = { ...DEFAULT_BANNER };

export const getAdBanner = async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const banner = await AdBanner.findOne({ isActive: true }).lean();
      if (banner) {
        return res.json({ success: true, banner });
      }
    }
    return res.json({ success: true, banner: MEMORY_BANNER });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateAdBanner = async (req: Request, res: Response) => {
  try {
    const { text, backgroundColor, textColor, link, isActive, showCloseButton } = req.body;

    if (isDbConnected()) {
      const updated = await AdBanner.findOneAndUpdate(
        {},
        {
          text: text || DEFAULT_BANNER.text,
          backgroundColor: backgroundColor || '#4f46e5',
          textColor: textColor || '#ffffff',
          link: link || '/shop',
          isActive: isActive !== undefined ? Boolean(isActive) : true,
          showCloseButton: showCloseButton !== undefined ? Boolean(showCloseButton) : true,
        },
        { new: true, upsert: true }
      );
      return res.json({ success: true, banner: updated });
    }

    MEMORY_BANNER = {
      ...MEMORY_BANNER,
      ...req.body,
    };
    return res.json({ success: true, banner: MEMORY_BANNER });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
