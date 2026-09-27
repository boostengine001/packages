import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Coupon from '@/models/Coupon';
import { db } from '@/data/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: All coupons for admin
export async function GET() {
  try {
    let coupons: any[] = [];
    try {
      const conn = await connectDB();
      if (conn && Coupon) {
        coupons = await Coupon.find({ isDeleted: { $ne: true } })
          .sort({ createdAt: -1 })
          .lean();
      }
    } catch (e) {}

    if (coupons.length === 0) {
      const fallback = db.getCoupons();
      return NextResponse.json({
        success: true,
        data: fallback,
        total: fallback.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: coupons.map((c) => ({
        ...c,
        id: c._id.toString(),
        minOrderValue: c.minSpend || 0,
        expiresAt: c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : '',
      })),
      total: coupons.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST: Create coupon
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.code || !body.value) {
      return NextResponse.json(
        { success: false, error: 'Coupon code and value are required' },
        { status: 400 }
      );
    }

    const couponData = {
      id: `c_${Date.now()}`,
      code: body.code.toUpperCase().trim(),
      type: body.type || 'PERCENT',
      value: Number(body.value),
      minOrderValue: Number(body.minOrderValue || body.minSpend || 0),
      maxDiscountCap: body.maxDiscountCap ? Number(body.maxDiscountCap) : undefined,
      usageCount: 0,
      maxUsageLimit: Number(body.maxUsageLimit || 1000),
      expiresAt: body.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    let createdMongo: any = null;
    try {
      const conn = await connectDB();
      if (conn && Coupon) {
        createdMongo = await Coupon.create({
          code: couponData.code,
          type: couponData.type.toLowerCase() === 'percent' ? 'percentage' : 'fixed',
          value: couponData.value,
          minSpend: couponData.minOrderValue,
          expiryDate: new Date(couponData.expiresAt),
          isActive: couponData.isActive,
          usageLimit: couponData.maxUsageLimit,
          usageCount: 0,
        });
      }
    } catch (e) {
      console.warn('MongoDB coupon save error:', e);
    }

    const saved = db.addCoupon(couponData as any);
    const finalData = createdMongo
      ? { ...createdMongo.toObject(), id: createdMongo._id.toString() }
      : saved;

    return NextResponse.json({ success: true, data: finalData }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

// PATCH: Toggle / update coupon
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    let updatedMongo: any = null;
    try {
      const conn = await connectDB();
      if (conn && Coupon) {
        updatedMongo = await Coupon.findByIdAndUpdate(id, updates, { new: true }).lean();
      }
    } catch (e) {}

    const updated = db.updateCoupon(id, updates);
    return NextResponse.json({ success: true, data: updatedMongo || updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE: Delete coupon
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    try {
      const conn = await connectDB();
      if (conn && Coupon) {
        await Coupon.findByIdAndUpdate(id, { isDeleted: true, isActive: false });
      }
    } catch (e) {}

    db.deleteCoupon(id);

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
