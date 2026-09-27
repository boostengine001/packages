import { NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Maximum 10MB file size limit for enterprise security
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed limit (10MB)' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || `upload_${Date.now()}.png`;
    const contentType = file.type || 'image/jpeg';

    let url = '';
    try {
      url = await uploadToS3(buffer, fileName, contentType);
    } catch (s3Err: any) {
      console.warn('S3 upload unavailable, falling back to base64 Data URL:', s3Err.message);
      const base64 = buffer.toString('base64');
      url = `data:${contentType};base64,${base64}`;
    }

    return NextResponse.json({
      success: true,
      url,
      fileName,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
