import sharp from 'sharp'

/**
 * Optimize uploaded image: resize + compress as JPEG
 * - Max 1920px width (hero slides, backgrounds)
 * - Quality 82 with mozjpeg progressive encoding
 * - PNG/WebP/HEIC automatically converted to JPEG
 * - Returns optimized buffer + content type
 */
export async function optimizeImage(
  buffer: Buffer,
  options?: { maxWidth?: number; quality?: number }
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const maxWidth = options?.maxWidth || 1920
  const quality = options?.quality || 82

  const optimized = await sharp(buffer)
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
 * Convert File to Buffer, optimize, and return
 */
export async function optimizeUploadedFile(
  file: File,
  options?: { maxWidth?: number; quality?: number }
): Promise<{ buffer: Buffer; contentType: string; ext: string; originalSize: number; optimizedSize: number }> {
  const arrayBuffer = await file.arrayBuffer()
  const originalBuffer = Buffer.from(arrayBuffer)
  const originalSize = originalBuffer.length

  const result = await optimizeImage(originalBuffer, options)

  console.log(`[ImageOptimize] ${file.name}: ${Math.round(originalSize/1024)}KB -> ${Math.round(result.buffer.length/1024)}KB (${Math.round((1 - result.buffer.length/originalSize) * 100)}% smaller)`)

  return {
    ...result,
    originalSize,
    optimizedSize: result.buffer.length,
  }
}
