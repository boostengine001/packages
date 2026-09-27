import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models';
import { isDbConnected } from '../db';

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  image: string;
  images: string[];
  description: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  hsn: string;
  gstRate: number;
  sizes: string[];
  colors: string[];
  isFeatured?: boolean;
}

export const DEMO_CATALOG: ProductItem[] = [
  {
    id: 'prod_1',
    title: 'Cyberpunk Heavyweight 450 GSM Hoodie',
    slug: 'cyberpunk-heavyweight-450-gsm-hoodie',
    price: 2499,
    compareAtPrice: 3999,
    category: 'Hoodies',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Crafted with 450 GSM pure French Terry cotton, oversized silhouette, ribbed cuffs, and brushed fleece interior.',
    rating: 4.9,
    reviewsCount: 64,
    inStock: true,
    hsn: '6109',
    gstRate: 18,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Onyx Black', 'Stone Grey', 'Vintage Cream'],
    isFeatured: true,
  },
  {
    id: 'prod_2',
    title: 'Acid Wash Vintage Boxy Tee',
    slug: 'acid-wash-vintage-boxy-tee',
    price: 1199,
    compareAtPrice: 1799,
    category: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    ],
    description: '240 GSM heavy combed single-jersey cotton with enzyme wash for authentic vintage streetwear draping.',
    rating: 4.8,
    reviewsCount: 42,
    inStock: true,
    hsn: '6109',
    gstRate: 18,
    sizes: ['M', 'L', 'XL'],
    colors: ['Washed Charcoal', 'Olive Green'],
    isFeatured: true,
  },
  {
    id: 'prod_3',
    title: 'Tactical Multi-Pocket Cargo Pants',
    slug: 'tactical-multi-pocket-cargo-pants',
    price: 2999,
    compareAtPrice: 4499,
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Water-repellent ripstop fabric with 6 utility pockets, custom YKK hardware, and adjustable ankle toggles.',
    rating: 4.7,
    reviewsCount: 38,
    inStock: true,
    hsn: '6203',
    gstRate: 18,
    sizes: ['30', '32', '34', '36'],
    colors: ['Matte Black', 'Desert Tan'],
    isFeatured: false,
  },
  {
    id: 'prod_4',
    title: 'Artisanal Matte Black Solid Fragrance (50ml)',
    slug: 'artisanal-matte-black-solid-fragrance-50ml',
    price: 1899,
    compareAtPrice: 2499,
    category: 'Fragrances',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Beeswax and jojoba base infused with smoked cedarwood, amber resin, and bergamot top notes. Long-lasting 12h projection.',
    rating: 5.0,
    reviewsCount: 89,
    inStock: true,
    hsn: '3303',
    gstRate: 18,
    sizes: ['50ml'],
    colors: ['Matte Black Jar'],
    isFeatured: true,
  },
];

export const getFeaturedProducts = async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const featured = await Product.find({ isFeatured: true, isActive: true }).limit(8).lean();
      if (featured.length > 0) {
        return res.json({ success: true, count: featured.length, products: featured });
      }
    }
    const fallback = DEMO_CATALOG.filter((p) => p.isFeatured);
    return res.json({ success: true, count: fallback.length, products: fallback });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, sort, limit = '50', page = '1' } = req.query;

    if (isDbConnected()) {
      const query: any = { isActive: { $ne: false } };

      if (category && category !== 'All') {
        const safeCategory = String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.category = { $regex: new RegExp(`^${safeCategory}$`, 'i') };
      }

      if (search) {
        const q = String(search).trim();
        const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
          { title: { $regex: safeQ, $options: 'i' } },
          { description: { $regex: safeQ, $options: 'i' } },
          { category: { $regex: safeQ, $options: 'i' } },
        ];
      }

      let sortOptions: any = { createdAt: -1 };
      if (sort === 'price_asc') sortOptions = { price: 1 };
      else if (sort === 'price_desc') sortOptions = { price: -1 };
      else if (sort === 'rating') sortOptions = { rating: -1 };

      const l = parseInt(String(limit), 10) || 50;
      const p = parseInt(String(page), 10) || 1;
      const skip = (p - 1) * l;

      const [products, total] = await Promise.all([
        Product.find(query).sort(sortOptions).skip(skip).limit(l).lean(),
        Product.countDocuments(query),
      ]);

      if (products.length > 0 || total > 0) {
        return res.json({
          success: true,
          count: products.length,
          total,
          page: p,
          totalPages: Math.ceil(total / l),
          products,
        });
      }
    }

    // In-memory fallback
    let items = [...DEMO_CATALOG];

    if (category && category !== 'All') {
      items = items.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      count: items.length,
      total: items.length,
      products: items,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getProductByIdOrSlug = async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;

    if (isDbConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

      const product = await Product.findOne({
        $or: [
          ...(isObjectId ? [{ _id: idOrSlug }] : []),
          { slug: idOrSlug },
          { id: idOrSlug },
        ],
      }).lean();

      if (product) {
        return res.json({ success: true, product });
      }
    }

    const item = DEMO_CATALOG.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    return res.json({ success: true, product: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      title,
      price,
      compareAtPrice,
      category,
      image,
      images,
      description,
      sizes,
      colors,
      inStock,
      isFeatured,
      hsn,
      gstRate,
    } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ success: false, error: 'Title, price, and category are required' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (isDbConnected()) {
      const created = await Product.create({
        title,
        name: title,
        slug: slug + '-' + Date.now().toString().slice(-4),
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : Number(price) * 1.3,
        category,
        image: image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        images: Array.isArray(images) && images.length ? images : [image],
        description: description || '',
        sizes: Array.isArray(sizes) && sizes.length ? sizes : ['S', 'M', 'L', 'XL'],
        colors: Array.isArray(colors) && colors.length ? colors : ['Onyx Black'],
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        isFeatured: Boolean(isFeatured),
        hsn: hsn || '6109',
        gstRate: gstRate || 18,
      });

      return res.status(201).json({
        success: true,
        message: 'Product created successfully in database',
        product: created,
      });
    }

    // In-memory creation
    const id = 'prod_' + (DEMO_CATALOG.length + 1) + '_' + Date.now().toString().slice(-4);
    const newProduct: ProductItem = {
      id,
      title,
      slug,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : Number(price) * 1.3,
      category,
      image: image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      images: Array.isArray(images) && images.length ? images : [image],
      description: description || 'Premium heavyweight garment.',
      rating: 5.0,
      reviewsCount: 1,
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      hsn: hsn || '6109',
      gstRate: gstRate || 18,
      sizes: Array.isArray(sizes) && sizes.length ? sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(colors) && colors.length ? colors : ['Onyx Black'],
      isFeatured: Boolean(isFeatured),
    };

    DEMO_CATALOG.unshift(newProduct);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully in memory',
      product: newProduct,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
      const updated = await Product.findOneAndUpdate(query, req.body, { new: true });
      if (updated) {
        return res.json({ success: true, message: 'Product updated in database', product: updated });
      }
    }

    const index = DEMO_CATALOG.findIndex((p) => p.id === id || p.slug === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    DEMO_CATALOG[index] = { ...DEMO_CATALOG[index], ...req.body, id: DEMO_CATALOG[index].id };
    return res.json({ success: true, message: 'Product updated in memory', product: DEMO_CATALOG[index] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
      const deleted = await Product.findOneAndDelete(query);
      if (deleted) {
        return res.json({ success: true, message: 'Product deleted from database', product: deleted });
      }
    }

    const index = DEMO_CATALOG.findIndex((p) => p.id === id || p.slug === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const removed = DEMO_CATALOG.splice(index, 1)[0];
    return res.json({ success: true, message: 'Product deleted from memory', product: removed });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
