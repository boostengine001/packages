import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Banner from '@/models/Banner';
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
    let mongoBanners: any[] = [];
    try {
      const conn = await connectDB();
      if (conn && Banner) {
        mongoBanners = await Banner.find({
          isActive: true,
          isDeleted: { $ne: true },
        })
          .sort({ desktopOrder: 1, createdAt: -1 })
          .lean();

        // If empty in MongoDB, seed initial banners
        if (mongoBanners.length === 0) {
          const initial = db.getBanners();
          if (initial.length > 0) {
            try {
              await Banner.insertMany(
                initial.map((b) => ({
                  title: b.title,
                  desktopImage: b.desktopImage,
                  mobileImage: b.mobileImage,
                  link: b.link,
                  buttonText: b.buttonText,
                  isActive: true,
                  isHeroBanner: b.isHeroBanner ?? true,
                  desktopOrder: b.desktopOrder || 1,
                  mobileOrder: b.mobileOrder || 1,
                  isDeleted: false,
                }))
              );
              mongoBanners = await Banner.find({ isActive: true, isDeleted: { $ne: true } })
                .sort({ desktopOrder: 1, createdAt: -1 })
                .lean();
            } catch (seedErr) {}
          }
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB banners fetch failed, using fallback:', dbErr);
    }

    if (mongoBanners.length > 0) {
      const heroBanners = mongoBanners.filter((b) => b.isHeroBanner);
      const promotionalBanners = mongoBanners.filter((b) => !b.isHeroBanner);

      const mapped = mongoBanners.map((b) => ({
        ...b,
        id: b._id.toString(),
        desktopImage: b.desktopImage || b.image,
        mobileImage: b.mobileImage || b.desktopImage || b.image,
      }));

      return NextResponse.json(
        {
          success: true,
          data: mapped,
          hero: heroBanners.length > 0 ? heroBanners.map((b) => ({
            ...b,
            id: b._id.toString(),
            desktopImage: b.desktopImage || b.image,
            mobileImage: b.mobileImage || b.desktopImage || b.image,
          })) : mapped,
          promotional: promotionalBanners.map((b) => ({
            ...b,
            id: b._id.toString(),
            desktopImage: b.desktopImage || b.image,
            mobileImage: b.mobileImage || b.desktopImage || b.image,
          })),
          total: mapped.length,
          source: 'mongodb',
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // In-memory fallback
    const fallbackBanners = db.getBanners();
    const heroFallback = fallbackBanners.filter((b) => b.isHeroBanner !== false);

    return NextResponse.json(
      {
        success: true,
        data: fallbackBanners,
        hero: heroFallback.length > 0 ? heroFallback : fallbackBanners,
        promotional: fallbackBanners.filter((b) => !b.isHeroBanner),
        total: fallbackBanners.length,
        source: 'fallback',
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching public banners:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch banners' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
