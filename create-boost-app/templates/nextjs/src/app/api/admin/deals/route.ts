import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Deal from '@/models/Deal';
import { db } from '@/data/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let deals: any[] = [];
    try {
      const conn = await connectDB();
      if (conn && Deal) {
        deals = await Deal.find({ isDeleted: { $ne: true } })
          .sort({ createdAt: -1 })
          .lean();
      }
    } catch (dbErr) {
      console.warn('MongoDB admin deals fetch error:', dbErr);
    }

    if (deals.length === 0) {
      const fallback = db.getDeals();
      return NextResponse.json({
        success: true,
        data: fallback,
        total: fallback.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: deals.map((d) => ({
        ...d,
        id: d._id.toString(),
      })),
      total: deals.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const dealData = {
      id: `DEAL-${Date.now().toString().slice(-4)}`,
      productId: body.productId,
      productTitle: body.productTitle,
      productImage: body.productImage || '',
      originalPrice: Number(body.originalPrice),
      dealPrice: Number(body.dealPrice),
      discountPercentage: Number(body.discountPercentage) || Math.round(((body.originalPrice - body.dealPrice) / body.originalPrice) * 100),
      quotaUnits: Number(body.quotaUnits) || 100,
      claimedUnits: 0,
      startTime: body.startTime || new Date().toISOString(),
      endTime: body.endTime || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      status: (body.status || 'ACTIVE') as 'ACTIVE' | 'SCHEDULED' | 'EXPIRED',
    };

    let createdMongo: any = null;
    try {
      const conn = await connectDB();
      if (conn && Deal) {
        createdMongo = await Deal.create(dealData);
      }
    } catch (dbErr) {
      console.warn('Could not save deal to MongoDB:', dbErr);
    }

    const saved = db.addDeal(dealData);
    const finalData = createdMongo
      ? { ...createdMongo.toObject(), id: createdMongo._id.toString() }
      : saved;

    return NextResponse.json({ success: true, data: finalData }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create deal' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Deal ID is required' },
        { status: 400 }
      );
    }

    try {
      const conn = await connectDB();
      if (conn && Deal) {
        await Deal.findByIdAndUpdate(id, { isDeleted: true, isActive: false });
      }
    } catch (dbErr) {
      console.warn('MongoDB deal delete error:', dbErr);
    }

    db.deleteDeal(id);

    return NextResponse.json({ success: true, message: 'Deal removed successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete deal' },
      { status: 500 }
    );
  }
}
