import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Deal from '@/models/Deal';
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
    let deals: any[] = [];
    try {
      const conn = await connectDB();
      if (conn && Deal) {
        deals = await Deal.find({
          isActive: true,
          isDeleted: { $ne: true },
          endTime: { $gte: new Date() },
        })
          .sort({ createdAt: -1 })
          .lean();
      }
    } catch (dbErr) {
      console.warn('MongoDB deals fetch error:', dbErr);
    }

    if (deals.length > 0) {
      return NextResponse.json(
        {
          success: true,
          source: 'mongodb',
          data: deals.map((d) => ({
            ...d,
            id: d._id.toString(),
          })),
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    const fallbackDeals = db.getDeals();
    return NextResponse.json(
      {
        success: true,
        source: 'fallback',
        data: fallbackDeals,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch deals' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
