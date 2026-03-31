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
 * URLASTONE watermark badge — sağ alt köşeye yarı saydam pill logo
 */
function createWatermarkSvg(imgWidth: number): Buffer {
  // Responsive boyut: resim genişliğine göre scale
  const badgeW = Math.max(180, Math.round(imgWidth * 0.18))
  const badgeH = Math.round(badgeW * 0.22)
  const fontSize = Math.round(badgeH * 0.52)
  const iconSize = Math.round(badgeH * 0.6)
  const rx = Math.round(badgeH / 2)
  const padding = Math.round(badgeH * 0.25)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${badgeW}" height="${badgeH}">
    <rect x="0" y="0" width="${badgeW}" height="${badgeH}" rx="${rx}" ry="${rx}" fill="rgba(0,0,0,0.55)"/>
    <text x="${padding + iconSize + 6}" y="${badgeH * 0.66}" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="700" fill="white" letter-spacing="1">
      <tspan fill="#b39345">URLA</tspan><tspan fill="white">STONE</tspan>
    </text>
  </svg>`

  return Buffer.from(svg)
}

/**
 * Add URLASTONE watermark to image buffer
 */
export async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata()
  const imgW = metadata.width || 1600
  const imgH = metadata.height || 1200

  const watermarkSvg = createWatermarkSvg(imgW)

  // Logo icon — logo-outline.png'yi oku (beyaz ev ikonu transparent bg)
  let logoComposites: sharp.OverlayOptions[] = []

  const badgeW = Math.max(180, Math.round(imgW * 0.18))
  const badgeH = Math.round(badgeW * 0.22)
  const margin = Math.round(Math.min(imgW, imgH) * 0.025)
  const iconSize = Math.round(badgeH * 0.6)
  const iconPadding = Math.round(badgeH * 0.25)

  // Logo dosyasını oku
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-outline.png')
    if (fs.existsSync(logoPath)) {
      const logoBuffer = await sharp(logoPath)
        .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer()

      logoComposites.push({
        input: logoBuffer,
        top: margin + Math.round((badgeH - iconSize) / 2),
        left: imgW - margin - badgeW + iconPadding,
      })
    }
  } catch {
    // Logo yoksa sadece text badge göster
  }

  const result = await sharp(imageBuffer)
    .composite([
      {
        input: watermarkSvg,
        top: margin,
        left: imgW - margin - badgeW,
      },
      ...logoComposites,
    ])
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
      // Watermark sonrası tekrar JPEG olarak sıkıştır
      finalBuffer = await sharp(finalBuffer)
        .jpeg({ quality: options?.quality || 82, progressive: true, mozjpeg: true })
        .toBuffer()
    } catch (err) {
      console.error('[ImageOptimize] Watermark error:', err)
      // Watermark başarısız olursa orijinal devam etsin
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
