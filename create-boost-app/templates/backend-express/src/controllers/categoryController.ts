import { Request, Response } from 'express';
import { Category } from '../models';
import { isDbConnected } from '../db';

const DEFAULT_CATEGORIES = [
  { name: 'Hoodies', slug: 'hoodies', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', displayOrder: 1, isActive: true },
  { name: 'T-Shirts', slug: 't-shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', displayOrder: 2, isActive: true },
  { name: 'Bottoms', slug: 'bottoms', image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80', displayOrder: 3, isActive: true },
  { name: 'Fragrances', slug: 'fragrances', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80', displayOrder: 4, isActive: true },
  { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', displayOrder: 5, isActive: true },
];

export const getCategories = async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
      if (categories.length > 0) {
        return res.json({ success: true, count: categories.length, categories });
      }
    }
    return res.json({ success: true, count: DEFAULT_CATEGORIES.length, categories: DEFAULT_CATEGORIES });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    if (isDbConnected()) {
      const cat = await Category.findOne({ slug }).lean();
      if (cat) return res.json({ success: true, category: cat });
    }
    const found = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
    if (!found) return res.status(404).json({ success: false, error: 'Category not found' });
    return res.json({ success: true, category: found });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, image, description, displayOrder } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Category name is required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (isDbConnected()) {
      const created = await Category.create({
        name,
        slug,
        image: image || '',
        description: description || '',
        displayOrder: displayOrder || 0,
        isActive: true,
      });
      return res.status(201).json({ success: true, category: created });
    }

    const newCat = { name, slug, image: image || '', description: description || '', displayOrder: displayOrder || 0, isActive: true };
    DEFAULT_CATEGORIES.push(newCat);
    return res.status(201).json({ success: true, category: newCat });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
      if (updated) return res.json({ success: true, category: updated });
    }
    return res.json({ success: true, message: 'Category updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await Category.findByIdAndDelete(id);
    }
    return res.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
