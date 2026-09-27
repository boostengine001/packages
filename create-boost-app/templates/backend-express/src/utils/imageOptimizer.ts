/**
 * Image Optimization & Compression Utility
 * Automatically resizes large camera/phone photos and compresses them to next-gen WebP format
 * to guarantee ultra-fast page load speeds, high PageSpeed/LCP scores, and minimal bandwidth costs.
 */

let sharpInstance: any = null;
try {
  // Dynamically resolve sharp so server boots smoothly even before npm install
  sharpInstance = require('sharp');
} catch {
  console.warn('\x1b[33m[ImageOptimizer] Note: Run "npm install" to activate Sharp WebP image compression.\x1b[0m');
}

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'jpg' | 'png' | 'original';
}

export interface OptimizedResult {
  buffer: Buffer;
  extension: string;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: string;
  optimized: boolean;
}

/**
 * Optimizes an image buffer:
 * - Auto-orients mobile/camera EXIF rotation
 * - Downscales ultra-large resolutions (e.g. 4000px down to 1600px without blur)
 * - Compresses to lightweight WebP format at 80% quality (~70-85% size reduction)
 */
export async function optimizeImage(
  fileBuffer: Buffer,
  originalExtension = 'jpg',
  options: OptimizeOptions = {}
): Promise<OptimizedResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 80,
    format = 'webp',
  } = options;

  const originalSize = fileBuffer.length;

  // If sharp is not installed or file is SVG, return safely without modification
  if (!sharpInstance || originalExtension === 'svg') {
    return {
      buffer: fileBuffer,
      extension: originalExtension,
      mimeType: originalExtension === 'svg' ? 'image/svg+xml' : `image/${originalExtension}`,
      originalSize,
      compressedSize: originalSize,
      savingsPercent: '0%',
      optimized: false,
    };
  }

  try {
    let pipeline = sharpInstance(fileBuffer)
      .rotate() // Auto-orient using EXIF data
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      });

    let targetExt = 'webp';
    let mimeType = 'image/webp';

    if (format === 'webp') {
      pipeline = pipeline.webp({ quality, effort: 4 });
      targetExt = 'webp';
      mimeType = 'image/webp';
    } else if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      targetExt = 'jpg';
      mimeType = 'image/jpeg';
    } else if (format === 'png') {
      pipeline = pipeline.png({ compressionLevel: 8 });
      targetExt = 'png';
      mimeType = 'image/png';
    } else {
      targetExt = originalExtension;
      mimeType = `image/${originalExtension}`;
    }

    const compressedBuffer = await pipeline.toBuffer();
    const compressedSize = compressedBuffer.length;
    const savings = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

    return {
      buffer: compressedBuffer,
      extension: targetExt,
      mimeType,
      originalSize,
      compressedSize,
      savingsPercent: `${savings}%`,
      optimized: true,
    };
  } catch (err) {
    console.error('[ImageOptimizer] Compression error, falling back to original buffer:', err);
    return {
      buffer: fileBuffer,
      extension: originalExtension,
      mimeType: `image/${originalExtension}`,
      originalSize,
      compressedSize: originalSize,
      savingsPercent: '0%',
      optimized: false,
    };
  }
}
