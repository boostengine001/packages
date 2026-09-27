import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AdBanner from '@/models/AdBanner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_BANNER = {
  id: 'default-ad-banner',
  text: '🔥 Free Express Shipping on orders above ₹999 | Use Code: BOOSTFIRST',
  backgroundColor: '#4f46e5',
  textColor: '#ffffff',
  link: '/products',
  isActive: true,
  showCloseButton: true,
};

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Surrogate-Control': 'no-store',
};

export async function GET() {
  try {
    let banner: any = null;
    try {
      await connectDB();
      banner = await AdBanner.findOne({ isActive: true }).lean();
    } catch (dbErr) {
      console.warn('MongoDB connection failed for ad-banner, using fallback:', dbErr);
    }

    return NextResponse.json(
      {
        success: true,
        data: banner ? { ...banner, id: (banner as any)._id?.toString() } : DEFAULT_BANNER,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching ad banner:', error);
    return NextResponse.json(
      { success: true, data: DEFAULT_BANNER },
      { headers: NO_CACHE_HEADERS }
    );
  }
}

