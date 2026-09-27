import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';
import { db } from '@/data/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
              ...mongoSetting,
              logo: (mongoSetting as any).logo || (mongoSetting as any).logoUrl || '',
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB settings fetch failed, using fallback:', dbErr);
    }

    const settings = db.getSettings();
    return NextResponse.json({ success: true, source: 'in-memory', data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (body.logo) {
      body.logoUrl = body.logo;
    } else if (body.logoUrl) {
      body.logo = body.logoUrl;
    }

    try {
      const conn = await dbConnect();
      if (conn && Setting) {
        const updatedMongo = await Setting.findOneAndUpdate(
          {},
          { $set: body },
          { new: true, upsert: true }
        ).lean();
        return NextResponse.json({
          success: true,
          source: 'mongodb',
          data: {
            ...updatedMongo,
            logo: (updatedMongo as any).logo || (updatedMongo as any).logoUrl || '',
          },
        });
      }
    } catch (dbErr) {
      console.warn('MongoDB settings update failed, using fallback:', dbErr);
    }

    const updated = db.updateSettings(body);
    return NextResponse.json({ success: true, source: 'in-memory', data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
