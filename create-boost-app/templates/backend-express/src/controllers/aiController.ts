import { Request, Response } from 'express';
import { Product } from '../models';
import { DEMO_CATALOG } from './productController';
import { isDbConnected } from '../db';

export const handleAiShoppingAssistant = async (req: Request, res: Response) => {
  try {
    const message = req.body.message || req.body.prompt;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message or prompt is required' });
    }

    const lowerQuery = message.toLowerCase();

    // 1. Budget extraction (e.g. under 2000, 1500 ke andar, under 5k)
    let maxBudget: number | null = null;
    const budgetMatch = lowerQuery.match(
      /(?:under|below|budget|mein|me|ke andar)?\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(k|thousand|lakh)?/i
    );

    if (budgetMatch && budgetMatch[1]) {
      let num = parseFloat(budgetMatch[1].replace(/,/g, ''));
      const unit = (budgetMatch[2] || '').toLowerCase();
      if (unit === 'k' || unit === 'thousand') num *= 1000;
      if (unit === 'lakh') num *= 100000;
      if (num > 100) maxBudget = num;
    }

    // 2. Keyword extraction
    const keywords = lowerQuery
      .replace(/[^\w\s]/gi, ' ')
      .split(/\s+/)
      .filter(
        (w) =>
          w.length > 2 &&
          !['bhai', 'mujhe', 'chahiye', 'kuch', 'under', 'wala', 'wali', 'best', 'good', 'show', 'options', 'please'].includes(
            w
          )
      );

    let allProducts: any[] = [];

    if (isDbConnected()) {
      allProducts = await Product.find({ isActive: true }).lean();
    }
    if (allProducts.length === 0) {
      allProducts = [...DEMO_CATALOG];
    }

    let matchedProducts = allProducts.filter((p: any) => {
      const price = p.price || 0;
      if (maxBudget !== null && price > maxBudget) return false;
      return true;
    });

    if (keywords.length > 0) {
      matchedProducts = matchedProducts
        .map((p) => {
          let score = 0;
          const searchCorpus = `${p.title} ${p.category} ${p.description}`.toLowerCase();
          for (const kw of keywords) {
            if (searchCorpus.includes(kw)) score += 2;
          }
          return { product: p, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.product);
    }

    if (matchedProducts.length === 0) {
      matchedProducts = allProducts.slice(0, 3);
    }

    return res.json({
      success: true,
      query: message,
      budgetDetected: maxBudget,
      reply: `I found ${matchedProducts.length} tailored recommendations for you:`,
      products: matchedProducts.slice(0, 5),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
