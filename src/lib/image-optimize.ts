import sharp from 'sharp'

/**
 * Optimize uploaded image: resize + compress as JPEG
 */
export async function optimizeImage(
  buffer: Buffer,
  options?: { maxWidth?: number; quality?: number }
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const maxWidth = options?.maxWidth || 1920
  const quality = options?.quality || 82

  const optimized = await sharp(buffer)
    .rotate()
    .resize(maxWidth, null, { withoutEnlargement: true })
    .jpeg({ quality, progressive: true, mozjpeg: true })
    .toBuffer()

  return {
    buffer: optimized,
    contentType: 'image/jpeg',
    ext: 'jpg',
  }
}

/**
 * Add URLASTONE watermark — server-side disabled, use client-side Canvas instead
 */
export async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  return imageBuffer
}

/**
 * Convert File to Buffer, optimize (no watermark on server), and return
 */
export async function optimizeUploadedFile(
  file: File,
  options?: { maxWidth?: number; quality?: number; watermark?: boolean }
): Promise<{ buffer: Buffer; contentType: string; ext: string; originalSize: number; optimizedSize: number }> {
  const arrayBuffer = await file.arrayBuffer()
  const originalBuffer = Buffer.from(arrayBuffer)
  const originalSize = originalBuffer.length

  const result = await optimizeImage(originalBuffer, options)

  console.log(`[ImageOptimize] ${file.name}: ${Math.round(originalSize/1024)}KB -> ${Math.round(result.buffer.length/1024)}KB (${Math.round((1 - result.buffer.length/originalSize) * 100)}% smaller)`)

  return {
    ...result,
    optimizedSize: result.buffer.length,
    originalSize,
  }
}
