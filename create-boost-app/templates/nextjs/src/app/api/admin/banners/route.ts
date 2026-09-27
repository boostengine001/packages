import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Banner from '@/models/Banner';
import { db } from '@/data/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET all banners for admin console
export async function GET() {
  try {
    let banners: any[] = [];
    try {
      const conn = await connectDB();
      if (conn && Banner) {
        banners = await Banner.find({ isDeleted: { $ne: true } })
          .sort({ desktopOrder: 1, createdAt: -1 })
          .lean();
      }
    } catch (dbErr) {
      console.warn('MongoDB admin banners fetch error:', dbErr);
    }

    if (banners.length === 0) {
      const fallback = db.getBanners();
      return NextResponse.json({
        success: true,
        data: fallback,
        total: fallback.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: banners.map((b) => ({
        ...b,
        id: b._id.toString(),
        desktopImage: b.desktopImage || b.image,
        mobileImage: b.mobileImage || b.desktopImage || b.image,
      })),
      total: banners.length,
    });
  } catch (error: any) {
    console.error('Error fetching admin banners:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST: Create a new banner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const bannerData = {
      id: `banner_${Date.now()}`,
      title: body.title || '',
      desktopImage: body.desktopImage || '',
      mobileImage: body.mobileImage || body.desktopImage || '',
      desktopOrder: Number(body.desktopOrder) || 0,
      mobileOrder: Number(body.mobileOrder) || 0,
      link: body.link || '/shop',
      buttonText: body.buttonText || 'Shop Now',
      isActive: body.isActive !== undefined ? body.isActive : true,
      isDeleted: false,
      orientation: body.orientation || 'landscape',
      titleColor: body.titleColor || '#ffffff',
      isHeroBanner: !!body.isHeroBanner,
      isNewArrival: !!body.isNewArrival,
    };

    let createdMongo: any = null;
    try {
      const conn = await connectDB();
      if (conn && Banner) {
        createdMongo = await Banner.create(bannerData);
      }
    } catch (dbErr) {
      console.warn('Could not save banner to MongoDB:', dbErr);
    }

    const saved = db.addBanner(bannerData as any);
    const finalData = createdMongo
      ? { ...createdMongo.toObject(), id: createdMongo._id.toString() }
      : saved;

    return NextResponse.json({ success: true, data: finalData }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create banner' },
      { status: 500 }
    );
  }
}

// PATCH: Update banner status or fields
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    let updatedMongo: any = null;
    try {
      const conn = await connectDB();
      if (conn && Banner) {
        updatedMongo = await Banner.findByIdAndUpdate(id, updates, { new: true }).lean();
      }
    } catch (dbErr) {
      console.warn('MongoDB banner update error:', dbErr);
    }

    const updated = db.updateBanner(id, updates);
    const finalData = updatedMongo
      ? { ...updatedMongo, id: updatedMongo._id.toString() }
      : updated || { id, ...updates };

    return NextResponse.json({ success: true, data: finalData });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete banner
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    try {
      const conn = await connectDB();
      if (conn && Banner) {
        await Banner.findByIdAndUpdate(id, { isDeleted: true, isActive: false });
      }
    } catch (dbErr) {
      console.warn('MongoDB banner delete error:', dbErr);
    }

    db.deleteBanner(id);

    return NextResponse.json({
      success: true,
      message: 'Banner removed successfully',
    });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
