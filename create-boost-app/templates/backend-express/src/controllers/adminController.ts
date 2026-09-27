import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Order, Product, User, ContactQuery, Subscriber } from '../models';
import { isDbConnected } from '../db';
import { optimizeImage } from '../utils/imageOptimizer';

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const [
        totalOrders,
        totalProducts,
        totalUsers,
        orders,
        contactQueries,
        subscribers,
      ] = await Promise.all([
        Order.countDocuments(),
        Product.countDocuments({ isActive: { $ne: false } }),
        User.countDocuments({ role: 'customer' }),
        Order.find().sort({ createdAt: -1 }).limit(5).lean(),
        ContactQuery.countDocuments({ status: 'new' }),
        Subscriber.countDocuments({ isActive: true }),
      ]);

      const allPaidOrders = await Order.find({ paymentStatus: 'paid' }).select('totalAmount').lean();
      const totalRevenue = allPaidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return res.json({
        success: true,
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts,
          totalCustomers: totalUsers,
          newQueries: contactQueries,
          totalSubscribers: subscribers,
          recentOrders: orders,
        },
      });
    }

    return res.json({
      success: true,
      stats: {
        totalRevenue: 2499,
        totalOrders: 1,
        totalProducts: 4,
        totalCustomers: 12,
        newQueries: 2,
        totalSubscribers: 48,
        recentOrders: [
          {
            orderId: 'ORD-892104',
            customer: { name: 'Kabir Verma', city: 'Bengaluru' },
            totalAmount: 2499,
            orderStatus: 'dispatched',
            paymentStatus: 'paid',
          },
        ],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    const { imageBase64, filename, fileUrl, quality, maxWidth } = req.body;

    if (fileUrl) {
      return res.json({ success: true, url: fileUrl });
    }

    if (imageBase64) {
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let fileBuffer: Buffer;
      let extension = 'jpg';

      if (matches && matches.length === 3) {
        const mime = matches[1];
        if (mime.includes('png')) extension = 'png';
        else if (mime.includes('webp')) extension = 'webp';
        else if (mime.includes('gif')) extension = 'gif';
        else if (mime.includes('svg')) extension = 'svg';
        fileBuffer = Buffer.from(matches[2], 'base64');
      } else {
        fileBuffer = Buffer.from(imageBase64, 'base64');
      }

      // Check max payload size (15MB raw)
      if (fileBuffer.length > 15 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: 'File size exceeds maximum 15MB limit' });
      }

      // ── Auto Image Compression & WebP Optimization ──────────────────────────
      const optimized = await optimizeImage(fileBuffer, extension, {
        maxWidth: maxWidth ? Number(maxWidth) : 1600,
        quality: quality ? Number(quality) : 80,
        format: extension === 'svg' ? 'original' : 'webp',
      });

      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const rawBaseName = filename ? filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '_') : 'img';
      const uniqueFileName = `${Date.now()}_${rawBaseName}.${optimized.extension}`;
      const targetPath = path.join(uploadDir, uniqueFileName);

      fs.writeFileSync(targetPath, optimized.buffer);

      const host = req.get('host') || 'localhost:3001';
      const protocol = req.protocol || 'http';
      const publicUrl = `${protocol}://${host}/uploads/${uniqueFileName}`;

      return res.json({
        success: true,
        url: publicUrl,
        filename: uniqueFileName,
        originalSize: optimized.originalSize,
        compressedSize: optimized.compressedSize,
        savings: optimized.savingsPercent,
        format: optimized.extension,
        optimized: optimized.optimized,
      });
    }

    return res.status(400).json({ success: false, error: 'Image file or Base64 payload is required' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getContactQueries = async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const queries = await ContactQuery.find().sort({ createdAt: -1 }).lean();
      return res.json({ success: true, count: queries.length, queries });
    }
    return res.json({ success: true, count: 0, queries: [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getSubscribers = async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const subs = await Subscriber.find().sort({ createdAt: -1 }).lean();
      return res.json({ success: true, count: subs.length, subscribers: subs });
    }
    return res.json({ success: true, count: 0, subscribers: [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
