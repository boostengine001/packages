import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { StoreProduct, PRODUCTS as INITIAL_PRODUCTS } from '@/data/products';
import { db } from '@/data/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

function normalizeProduct(p: any): StoreProduct {
  const images = (p.images && p.images.length > 0)
    ? p.images
    : p.image
    ? [p.image]
    : p.media && p.media.length > 0
    ? p.media.map((m: any) => m.url)
    : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80'];

  return {
    ...p,
    id: p.id || p._id?.toString(),
    _id: p._id?.toString(),
    title: p.title || p.name || 'Untitled Product',
    name: p.name || p.title || 'Untitled Product',
    brand: p.brand || 'Boost Brand',
    category: typeof p.category === 'object' && p.category?.name ? p.category.name : (p.category || 'General'),
    price: Number(p.salePrice || p.price || 0),
    salePrice: p.salePrice ? Number(p.salePrice) : undefined,
    compareAtPrice: Number(p.compareAtPrice || p.price || 0),
    images,
    image: images[0],
    inStock: p.inStock !== false,
    rating: p.rating || { value: 4.8, count: 24 },
    variants: p.variants?.map((v: any) => ({
      ...v,
      id: v.id || v.sku,
      title: v.title || v.name || v.options?.map((o: any) => o.value).join(' / ') || v.sku,
      name: v.name || v.title || v.sku,
      price: Number(v.salePrice || v.price || p.price || 0),
      compareAtPrice: Number(v.compareAtPrice || v.price || p.compareAtPrice || 0),
      stock: v.stock !== undefined ? Number(v.stock) : 10,
    })) || [],
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const query = searchParams.get('q')?.toLowerCase().trim();
    const dealOnly = searchParams.get('deal') === 'true';

    try {
      const conn = await dbConnect();
      if (conn && Product) {
        // Auto-seed if empty
        const count = await Product.countDocuments();
        if (count === 0) {
          console.log('🌱 Seeding initial products into MongoDB...');
          await Product.insertMany(
            INITIAL_PRODUCTS.map((p) => ({
              ...p,
              id: p.id,
              title: p.title || p.name,
              name: p.title || p.name,
              images: p.images || (p.image ? [p.image] : []),
              image: p.image || (p.images && p.images[0]) || '',
              tags: p.tags || [],
              variants: p.variants || [],
              reviews: p.reviews || [],
            }))
          );
        }

        // Single product lookup by ID, ObjectId, SKU, or slug
        if (id) {
          const singleQuery =
            mongoose.Types.ObjectId.isValid(id) && id.length === 24
              ? { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { id: id }, { sku: id }, { slug: id }] }
              : { $or: [{ id: id }, { sku: id }, { slug: id }] };

          const single = await Product.findOne(singleQuery).lean();
          if (single) {
            return NextResponse.json(
              { success: true, source: 'mongodb', data: normalizeProduct(single) },
              { headers: NO_CACHE_HEADERS }
            );
          }

          // Fallback to in-memory store
          const fallbackProduct =
            db.getProductById(id) || INITIAL_PRODUCTS.find((p) => p.id === id || p.sku === id || p.slug === id);
          if (fallbackProduct) {
            return NextResponse.json(
              { success: true, source: 'fallback', data: normalizeProduct(fallbackProduct) },
              { headers: NO_CACHE_HEADERS }
            );
          }

          return NextResponse.json(
            { success: false, source: 'not_found', error: 'Product not found', data: null },
            { status: 404, headers: NO_CACHE_HEADERS }
          );
        }

        // Query filter
        const filter: Record<string, any> = { isDeleted: { $ne: true } };
        if (category && category !== 'All') {
          filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }
        if (query) {
          filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } },
            { brand: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } },
            { description: { $regex: query, $options: 'i' } },
          ];
        }

        let mongoProducts = await Product.find(filter).sort({ createdAt: -1 }).lean();

        // Optional category name map for category IDs
        try {
          const allCats = await Category.find({}).lean();
          const catMap = new Map<string, string>();
          allCats.forEach((c: any) => {
            if (c._id && c.name) catMap.set(c._id.toString(), c.name);
          });

          mongoProducts = mongoProducts.map((p: any) => {
            if (p.category && catMap.has(p.category.toString())) {
              return { ...p, category: catMap.get(p.category.toString()) };
            }
            return p;
          });
        } catch (catErr) {
          // ignore
        }

        let normalizedList = mongoProducts.map(normalizeProduct);

        if (dealOnly) {
          normalizedList.sort((a: any, b: any) => {
            const discA = (a.compareAtPrice - a.price) / a.compareAtPrice;
            const discB = (b.compareAtPrice - b.price) / b.compareAtPrice;
            return discB - discA;
          });
        }

        return NextResponse.json(
          {
            success: true,
            source: 'mongodb',
            total: normalizedList.length,
            data: normalizedList,
          },
          { headers: NO_CACHE_HEADERS }
        );
      }
    } catch (dbErr) {
      console.warn('MongoDB products fetch failed, using fallback:', dbErr);
    }

    // No Mongo: serve the in-memory store so admin edits are visible immediately.
    let fallbackList = [...db.getProducts()];
    if (fallbackList.length === 0) {
      fallbackList = [...INITIAL_PRODUCTS];
    }
    if (id) {
      const found = fallbackList.find((p) => p.id === id || p.sku === id || p.slug === id);
      return NextResponse.json(
        {
          success: !!found,
          source: 'fallback',
          data: found ? normalizeProduct(found) : null,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (category && category !== 'All') {
      fallbackList = fallbackList.filter((p) => (p.category || '').toLowerCase() === category.toLowerCase());
    }
    if (query) {
      fallbackList = fallbackList.filter(
        (p) =>
          (p.title || p.name || '').toLowerCase().includes(query) ||
          (p.brand || '').toLowerCase().includes(query) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(query))
      );
    }

    const normalizedFallback = fallbackList.map(normalizeProduct);

    return NextResponse.json(
      {
        success: true,
        source: 'fallback',
        total: normalizedFallback.length,
        data: normalizedFallback,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
