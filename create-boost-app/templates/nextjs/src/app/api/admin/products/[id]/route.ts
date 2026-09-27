import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { db } from '@/data/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function buildProductQuery(id: string) {
  if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
    return {
      $or: [
        { _id: new mongoose.Types.ObjectId(id) },
        { id: id },
        { slug: id },
        { sku: id },
      ],
    };
  }
  return {
    $or: [{ id: id }, { slug: id }, { sku: id }],
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const query = buildProductQuery(id);

    // Check MongoDB first
    try {
      const conn = await dbConnect();
      if (conn && Product) {
        const mongoProd = await Product.findOne(query).lean();
        if (mongoProd) {
          const normalized = {
            ...(mongoProd as any),
            id: (mongoProd as any).id || (mongoProd as any)._id?.toString(),
            _id: (mongoProd as any)._id?.toString(),
            title: (mongoProd as any).title || (mongoProd as any).name,
          };
          return NextResponse.json({ success: true, source: 'mongodb', data: normalized });
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB single product fetch error:', dbErr);
    }

    // In-memory fallback
    const product = db.getProductById(id) || db.getProducts().find((p) => p.slug === id || p.sku === id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, source: 'in-memory', data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const query = buildProductQuery(id);

    let updatedMongo: any = null;

    // Update in MongoDB
    try {
      const conn = await dbConnect();
      if (conn && Product) {
        // Sync name and title
        const updatePayload: Record<string, any> = { ...body };
        if (updatePayload.title && !updatePayload.name) updatePayload.name = updatePayload.title;
        if (updatePayload.name && !updatePayload.title) updatePayload.title = updatePayload.name;
        if (updatePayload.images && Array.isArray(updatePayload.images) && updatePayload.images.length > 0) {
          updatePayload.image = updatePayload.images[0];
          updatePayload.media = updatePayload.images.map((url: string) => ({ type: 'image', url }));
        }

        updatedMongo = await Product.findOneAndUpdate(query, { $set: updatePayload }, { new: true }).lean();
      }
    } catch (dbErr) {
      console.warn('MongoDB product PUT error:', dbErr);
    }

    const updated = db.updateProduct(id, body);
    const finalData = updatedMongo ? {
      ...updatedMongo,
      id: updatedMongo.id || updatedMongo._id?.toString(),
      _id: updatedMongo._id?.toString(),
    } : updated || { id, ...body };

    return NextResponse.json({ success: true, data: finalData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error updating product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const query = buildProductQuery(id);

    // Delete from MongoDB
    try {
      const conn = await dbConnect();
      if (conn && Product) {
        await Product.findOneAndDelete(query);
      }
    } catch (dbErr) {
      console.warn('MongoDB product DELETE error:', dbErr);
    }

    const success = db.deleteProduct(id);
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error deleting product' },
      { status: 500 }
    );
  }
}

