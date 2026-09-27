import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Review, Product } from '../models';
import { isDbConnected } from '../db';

const DEFAULT_REVIEWS = [
  {
    _id: 'rev_1',
    productId: 'prod_1',
    author: 'Aarav Mehta',
    rating: 5,
    title: 'Insane fabric quality!',
    comment: 'The 450 GSM weight is real. Fits boxy and structured, feels like a 10k international luxury brand hoodie.',
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    _id: 'rev_2',
    productId: 'prod_1',
    author: 'Rohan Sharma',
    rating: 5,
    title: 'Worth every rupee',
    comment: 'Very warm, perfect oversized drop-shoulder cut. Onyx black is deeply saturated.',
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    _id: 'rev_3',
    productId: 'prod_2',
    author: 'Ishan Patel',
    rating: 5,
    title: 'Top notch acid wash',
    comment: 'Vintage charcoal wash is 10/10. Heavy collar ribbing that doesn’t stretch out after washes.',
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId query parameter is required' });
    }

    const pid = String(productId);

    if (isDbConnected()) {
      const reviews = await Review.find({ productId: pid }).sort({ createdAt: -1 }).lean();
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = totalRating / reviews.length;
        return res.json({
          success: true,
          count: reviews.length,
          averageRating: Math.round(avg * 10) / 10,
          reviews,
        });
      }
    }

    const matched = DEFAULT_REVIEWS.filter((r) => r.productId === pid);
    const avg = matched.length ? matched.reduce((a, b) => a + b.rating, 0) / matched.length : 5.0;

    return res.json({
      success: true,
      count: matched.length,
      averageRating: Math.round(avg * 10) / 10,
      reviews: matched,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId, author, rating, title, comment, images } = req.body;

    if (!productId || !author || !rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'productId, author, rating, and comment are required',
      });
    }

    const numRating = Math.min(5, Math.max(1, Number(rating)));

    if (isDbConnected()) {
      const newReview = await Review.create({
        productId,
        author,
        rating: numRating,
        title: title || '',
        comment,
        verifiedBuyer: true,
        images: Array.isArray(images) ? images : [],
      });

      const allReviews = await Review.find({ productId });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      const isObjectId = mongoose.Types.ObjectId.isValid(productId);

      await Product.findOneAndUpdate(
        { $or: [{ slug: productId }, ...(isObjectId ? [{ _id: productId }] : [])] },
        { rating: Math.round(avg * 10) / 10, reviewsCount: allReviews.length }
      );

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully!',
        review: newReview,
      });
    }

    const reviewObj = {
      _id: 'rev_' + Date.now(),
      productId,
      author,
      rating: numRating,
      title: title || '',
      comment,
      verifiedBuyer: true,
      createdAt: new Date().toISOString(),
    };
    DEFAULT_REVIEWS.unshift(reviewObj);

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully (in memory)!',
      review: reviewObj,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
