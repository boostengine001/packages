import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Coupon from '@/models/Coupon';
import { db } from '@/data/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

// GET: list active public coupons
export async function GET() {
  try {
    let coupons: any[] = [];
    try {
      const conn = await connectDB();
      if (conn && Coupon) {
        coupons = await Coupon.find({
          isActive: true,
          isDeleted: { $ne: true },
          expiryDate: { $gte: new Date() },
        })
          .select('code type value minSpend')
          .lean();
      }
    } catch (e) {}

    if (coupons.length > 0) {
      return NextResponse.json(
        { success: true, data: coupons },
        { headers: NO_CACHE_HEADERS }
      );
    }

    const fallbackCoupons = db.getCoupons().filter((c) => c.isActive);
    return NextResponse.json(
      { success: true, data: fallbackCoupons },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch coupons' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST: Validate coupon code with cart subtotal
export async function POST(req: NextRequest) {
  try {
    const { code, cartSubtotal = 0 } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const upperCode = code.trim().toUpperCase();

    // Check MongoDB first
    try {
      const conn = await connectDB();
      if (conn && Coupon) {
        const mongoCoupon = await Coupon.findOne({
          code: upperCode,
          isActive: true,
          isDeleted: { $ne: true },
        }).lean();

        if (mongoCoupon) {
          if (new Date(mongoCoupon.expiryDate) < new Date()) {
            return NextResponse.json(
              { success: false, error: 'Coupon has expired' },
              { status: 400, headers: NO_CACHE_HEADERS }
            );
          }

          if (mongoCoupon.minSpend && cartSubtotal < mongoCoupon.minSpend) {
            return NextResponse.json(
              {
                success: false,
                error: `Minimum order value of ₹${mongoCoupon.minSpend} required for this coupon`,
              },
              { status: 400, headers: NO_CACHE_HEADERS }
            );
          }

          let discountAmount = 0;
          if (mongoCoupon.type === 'percentage') {
            discountAmount = Math.round((cartSubtotal * mongoCoupon.value) / 100);
          } else {
            discountAmount = mongoCoupon.value;
          }

          return NextResponse.json(
            {
              success: true,
              data: {
                code: mongoCoupon.code,
                type: mongoCoupon.type,
                value: mongoCoupon.value,
                discountAmount: Math.min(discountAmount, cartSubtotal),
              },
            },
            { headers: NO_CACHE_HEADERS }
          );
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB coupon validation error:', dbErr);
    }

    // Fallback to in-memory store
    const memCoupon = db.getCouponByCode(upperCode);
    if (!memCoupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid or inactive coupon code' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    if (cartSubtotal < memCoupon.minOrderValue) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order value of ₹${memCoupon.minOrderValue} required for this coupon`,
        },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    let discountAmount = 0;
    if (memCoupon.type === 'PERCENT') {
      discountAmount = Math.round((cartSubtotal * memCoupon.value) / 100);
      if (memCoupon.maxDiscountCap) {
        discountAmount = Math.min(discountAmount, memCoupon.maxDiscountCap);
      }
    } else {
      discountAmount = memCoupon.value;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          code: memCoupon.code,
          type: memCoupon.type,
          value: memCoupon.value,
          discountAmount: Math.min(discountAmount, cartSubtotal),
        },
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Coupon validation failed' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
