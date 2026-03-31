import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

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
 * Add URLASTONE watermark to image buffer
 * Hazır watermark-badge.png'yi resize edip sağ üst köşeye yapıştırır
 */
export async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata()
  const imgW = metadata.width || 1600
  const imgH = metadata.height || 1200

  const badgePath = path.join(process.cwd(), 'public', 'watermark-badge.png')
  if (!fs.existsSync(badgePath)) return imageBuffer

  // Badge genişliği: resim genişliğinin %20'si (min 150, max 350)
  const badgeW = Math.max(150, Math.min(350, Math.round(imgW * 0.2)))
  const badgeBuffer = await sharp(badgePath)
    .resize(badgeW, null, { withoutEnlargement: false, kernel: 'lanczos3' })
    .toBuffer()

  const margin = Math.round(Math.min(imgW, imgH) * 0.02)

  const result = await sharp(imageBuffer)
    .composite([{ input: badgeBuffer, top: margin, left: imgW - margin - badgeW }])
    .toBuffer()

  return result
}

/**
 * Convert File to Buffer, optimize, add watermark, and return
 */
export async function optimizeUploadedFile(
  file: File,
  options?: { maxWidth?: number; quality?: number; watermark?: boolean }
): Promise<{ buffer: Buffer; contentType: string; ext: string; originalSize: number; optimizedSize: number }> {
  const arrayBuffer = await file.arrayBuffer()
  const originalBuffer = Buffer.from(arrayBuffer)
  const originalSize = originalBuffer.length

  const result = await optimizeImage(originalBuffer, options)

  // Watermark ekle (varsayılan: true)
  let finalBuffer = result.buffer
  if (options?.watermark !== false) {
    try {
      finalBuffer = await addWatermark(result.buffer)
      finalBuffer = await sharp(finalBuffer)
        .jpeg({ quality: options?.quality || 82, progressive: true, mozjpeg: true })
        .toBuffer()
    } catch (err) {
      console.error('[ImageOptimize] Watermark error:', err)
      finalBuffer = result.buffer
    }
  }

  console.log(`[ImageOptimize] ${file.name}: ${Math.round(originalSize/1024)}KB -> ${Math.round(finalBuffer.length/1024)}KB (${Math.round((1 - finalBuffer.length/originalSize) * 100)}% smaller)${options?.watermark !== false ? ' +watermark' : ''}`)

  return {
    ...result,
    buffer: finalBuffer,
    optimizedSize: finalBuffer.length,
    originalSize,
  }
}
