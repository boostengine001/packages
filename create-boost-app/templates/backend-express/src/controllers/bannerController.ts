import { Request, Response } from 'express';
import { Banner } from '../models';
import { isDbConnected } from '../db';

const DEFAULT_BANNERS = [
  {
    _id: 'banner_1',
    title: 'Drop 04: Cyberpunk Heavyweights',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&q=80',
    link: '/category/hoodies',
    buttonText: 'Explore Drop',
    isActive: true,
    isHeroBanner: true,
    desktopOrder: 1,
    mobileOrder: 1,
  },
  {
    _id: 'banner_2',
    title: 'Acid Wash Streetwear Essentials',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
    link: '/category/t-shirts',
    buttonText: 'Shop Tees',
    isActive: true,
    isHeroBanner: false,
    desktopOrder: 2,
    mobileOrder: 2,
  },
];

export const getBanners = async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const banners = await Banner.find({ isActive: true }).sort({ desktopOrder: 1 }).lean();
      if (banners.length > 0) {
        return res.json({ success: true, count: banners.length, banners });
      }
    }
    return res.json({ success: true, count: DEFAULT_BANNERS.length, banners: DEFAULT_BANNERS });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const { title, image, link, buttonText, isHeroBanner, desktopOrder } = req.body;
    if (!image) return res.status(400).json({ success: false, error: 'Banner image is required' });

    if (isDbConnected()) {
      const created = await Banner.create({
        title: title || '',
        image,
        link: link || '/shop',
        buttonText: buttonText || 'Shop Now',
        isHeroBanner: Boolean(isHeroBanner),
        desktopOrder: desktopOrder || 1,
        isActive: true,
      });
      return res.status(201).json({ success: true, banner: created });
    }

    const newBanner = {
      _id: 'banner_' + (DEFAULT_BANNERS.length + 1),
      title: title || '',
      image,
      link: link || '/shop',
      buttonText: buttonText || 'Shop Now',
      isHeroBanner: Boolean(isHeroBanner),
      desktopOrder: desktopOrder || 1,
      mobileOrder: desktopOrder || 1,
      isActive: true,
    };
    DEFAULT_BANNERS.push(newBanner);
    return res.status(201).json({ success: true, banner: newBanner });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const updated = await Banner.findByIdAndUpdate(id, req.body, { new: true });
      if (updated) return res.json({ success: true, banner: updated });
    }
    return res.json({ success: true, message: 'Banner updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await Banner.findByIdAndDelete(id);
    }
    return res.json({ success: true, message: 'Banner deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
