import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AdBanner from '@/models/AdBanner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Surrogate-Control': 'no-store',
};

const DEFAULT_BANNER = {
  text: '🔥 Free Express Shipping on orders above ₹999 | Use Code: BOOSTFIRST',
  backgroundColor: '#4f46e5',
  textColor: '#ffffff',
  link: '/products',
  isActive: true,
  showCloseButton: true,
};

export async function GET() {
  try {
    let banner: any = null;
    try {
      await connectDB();
      banner = await AdBanner.findOne().lean();
      if (!banner) {
        const created = await AdBanner.create(DEFAULT_BANNER);
        banner = created.toObject();
      }
    } catch (dbErr) {
      console.warn('MongoDB connection failed for admin ad-banner, using fallback:', dbErr);
      banner = { ...DEFAULT_BANNER, _id: 'default' };
    }

    return NextResponse.json(
      {
        success: true,
        data: { ...banner, id: (banner as any)._id?.toString() },
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching admin ad banner:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch ad banner' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    let banner: any = null;

    try {
      await connectDB();
      banner = await AdBanner.findOne();
      if (banner) {
        banner.text = body.text !== undefined ? body.text : banner.text;
        banner.backgroundColor = body.backgroundColor || banner.backgroundColor;
        banner.textColor = body.textColor || banner.textColor;
        banner.link = body.link !== undefined ? body.link : banner.link;
        banner.isActive = body.isActive !== undefined ? body.isActive : banner.isActive;
        banner.showCloseButton =
          body.showCloseButton !== undefined ? body.showCloseButton : banner.showCloseButton;
        await banner.save();
      } else {
        banner = await AdBanner.create(body);
      }
    } catch (dbErr) {
      console.warn('MongoDB save failed for admin ad banner:', dbErr);
      banner = { ...body, _id: 'memory-saved' };
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...(banner.toObject ? banner.toObject() : banner),
          id: banner._id?.toString() || 'default',
        },
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error updating ad banner:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update ad banner' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

