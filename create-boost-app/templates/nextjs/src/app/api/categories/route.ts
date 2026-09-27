import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { PRODUCTS as INITIAL_PRODUCTS } from '@/data/products';
import { db } from '@/data/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function GET() {
  try {
    const conn = await connectDB();
    if (!conn) {
      // No Mongo: derive the taxonomy from the live product catalog so the
      // storefront filters still work and admin-made products show up.
      const derived = Array.from(new Set(db.getProducts().map((p) => p.category).filter(Boolean)))
        .sort()
        .map((name) => ({
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          _id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          subcategories: [],
        }));

      return NextResponse.json(
        { success: true, data: derived, all: derived, total: derived.length, source: 'fallback' },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // Fetch all active categories that are not deleted
    let allCategories = await Category.find({
      isDeleted: { $ne: true },
      isActive: true,
    })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Auto-heal if collection is empty
    if (allCategories.length === 0) {
      let catNames: string[] = [];
      try {
        const distinctFromDb = await Product.distinct('category');
        catNames = distinctFromDb.filter((c: any) => typeof c === 'string' && c.trim().length > 0);
      } catch (e) {}
      if (catNames.length === 0) {
        catNames = Array.from(new Set(INITIAL_PRODUCTS.map((p) => p.category).filter(Boolean)));
      }
      try {
        for (let i = 0; i < catNames.length; i++) {
          const name = catNames[i];
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          await Category.findOneAndUpdate(
            { slug },
            { $setOnInsert: { name, slug, displayOrder: i, isActive: true, isDeleted: false } },
            { upsert: true, new: true }
          );
        }
        allCategories = await Category.find({ isDeleted: { $ne: true }, isActive: true })
          .sort({ displayOrder: 1, name: 1 })
          .lean();
      } catch (seedErr) {
        console.warn('Category auto-seed warning:', seedErr);
      }
    }

    // Group into parent categories and subcategories
    const parentCategories = allCategories.filter((c) => !c.parent);
    const subCategories = allCategories.filter((c) => !!c.parent);

    const tree = parentCategories.map((parent) => ({
      ...parent,
      id: parent._id.toString(),
      subcategories: subCategories
        .filter((sub) => sub.parent?.toString() === parent._id.toString())
        .map((sub) => ({
          ...sub,
          id: sub._id.toString(),
        })),
    }));

    return NextResponse.json(
      {
        success: true,
        data: tree.length > 0 ? tree : allCategories.map((c) => ({ ...c, id: c._id.toString(), subcategories: [] })),
        all: allCategories.map((c) => ({ ...c, id: c._id.toString() })),
        total: allCategories.length,
        source: 'mongodb',
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
