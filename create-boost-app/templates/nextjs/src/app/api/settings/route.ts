import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';
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
    try {
      const conn = await dbConnect();
      if (conn && Setting) {
        const mongoSetting = await Setting.findOne().lean();
        if (mongoSetting) {
          return NextResponse.json({
            success: true,
            source: 'mongodb',
            data: {
              storeName: (mongoSetting as any).storeName || 'Boost Aesthetic',
              storeUrl: (mongoSetting as any).storeUrl || 'https://booststore.com',
              logo: (mongoSetting as any).logo || (mongoSetting as any).logoUrl || '',
              favicon: (mongoSetting as any).favicon || '',
              supportEmail: (mongoSetting as any).supportEmail || 'support@booststore.com',
              supportPhone: (mongoSetting as any).supportPhone || '+91 98765 43210',
              freeShippingThreshold: (mongoSetting as any).freeShippingThreshold ?? 999,
              currency: (mongoSetting as any).currency || 'INR',
              currencySymbol: (mongoSetting as any).currencySymbol || '₹',
              enableCod: (mongoSetting as any).enableCod !== false,
              gstin: (mongoSetting as any).gstin || '',
              state: (mongoSetting as any).state || 'Maharashtra',
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB settings fetch failed, using fallback:', dbErr);
    }

    const fallback = db.getSettings();
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: {
        storeName: fallback.storeName || 'Boost Aesthetic',
        storeUrl: fallback.storeUrl || 'https://booststore.com',
        logo: fallback.logo || '',
        favicon: fallback.favicon || '',
        supportEmail: fallback.supportEmail || 'support@booststore.com',
        supportPhone: fallback.supportPhone || '+91 98765 43210',
        freeShippingThreshold: fallback.freeShippingThreshold ?? 999,
        currency: fallback.currency || 'INR',
        currencySymbol: fallback.currencySymbol || '₹',
        enableCod: fallback.enableCod !== false,
        gstin: fallback.gstin || '',
        state: fallback.state || 'Maharashtra',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch store settings' },
      { status: 500 }
    );
  }
}
