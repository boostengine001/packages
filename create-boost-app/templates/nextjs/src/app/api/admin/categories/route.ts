import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import { db } from '@/data/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Surrogate-Control': 'no-store',
};

// GET all categories and subcategories for admin console
export async function GET() {
  try {
    let categories: any[] = [];
    try {
      await connectDB();
      categories = await Category.find({ isDeleted: { $ne: true } })
        .populate('parent', 'name slug')
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();
    } catch (dbErr) {
      console.warn('MongoDB connection failed for admin categories, falling back to db:', dbErr);
    }

    if (!categories || categories.length === 0) {
      const memoryCategories = db.getCategories();
      categories = memoryCategories.map((c) => ({
        _id: c.id,
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image || '',
        description: c.description || '',
        displayOrder: 0,
        isActive: true,
      }));
    }

    return NextResponse.json(
      {
        success: true,
        data: categories.map((c: any) => ({
          ...c,
          id: c._id ? c._id.toString() : c.id,
        })),
        total: categories.length,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching admin categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST: Create a new category or subcategory
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    let newCategory: any = null;
    try {
      await connectDB();
      newCategory = await Category.create({
        name: body.name,
        slug,
        image: body.image || '',
        description: body.description || '',
        parent: body.parent || null,
        parents: body.parent ? [body.parent] : [],
        displayOrder: Number(body.displayOrder) || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isDeleted: false,
      });
    } catch (dbErr) {
      console.warn('MongoDB Category create error, continuing in-memory:', dbErr);
    }

    // Always sync in-memory
    const memoryCategory = {
      id: newCategory ? newCategory._id.toString() : slug,
      name: body.name,
      slug,
      image: body.image || '',
      description: body.description || '',
    };
    db.addCategory(memoryCategory);

    return NextResponse.json(
      {
        success: true,
        data: newCategory
          ? { ...newCategory.toObject(), id: newCategory._id.toString() }
          : memoryCategory,
      },
      { status: 201, headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PATCH / PUT: Update category
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (updates.parent === '') {
      updates.parent = null;
      updates.parents = [];
    } else if (updates.parent) {
      updates.parents = [updates.parent];
    }

    let updated: any = null;
    try {
      await connectDB();
      const query = mongoose.isValidObjectId(id)
        ? { _id: id }
        : { $or: [{ slug: id }, { name: id }] };
      updated = await Category.findOneAndUpdate(query, updates, { new: true });
    } catch (dbErr) {
      console.warn('MongoDB Category update error, continuing with memory sync:', dbErr);
    }

    // Sync in-memory
    db.updateCategory(id, updates);

    return NextResponse.json(
      {
        success: true,
        data: updated
          ? { ...updated.toObject(), id: updated._id.toString() }
          : { id, ...updates },
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update category' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// DELETE: Soft delete category
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    try {
      await connectDB();
      const query = mongoose.isValidObjectId(id)
        ? { _id: id }
        : { $or: [{ slug: id }, { name: id }] };
      await Category.findOneAndUpdate(query, { isDeleted: true, isActive: false });
    } catch (dbErr) {
      console.warn('MongoDB Category delete error:', dbErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Category deleted successfully',
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete category' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
