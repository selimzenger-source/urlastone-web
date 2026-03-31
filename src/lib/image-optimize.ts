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
 * URLASTONE watermark badge — sağ alt köşeye yarı saydam pill logo
 */
function createWatermarkSvg(imgWidth: number): { svg: Buffer; badgeW: number; badgeH: number } {
  // Responsive boyut — video overlay'dekiyle aynı görünüm
  const iconS = Math.max(14, Math.min(28, Math.round(imgWidth * 0.018)))
  const fontSize = Math.round(iconS * 0.85)
  const gap = Math.round(iconS * 0.35)
  const padX = Math.round(iconS * 0.5)
  const padY = Math.round(iconS * 0.35)
  const textW = Math.round(fontSize * 6.2)
  const badgeW = padX + iconS + gap + textW + padX
  const badgeH = iconS + padY * 2
  const rx = Math.round(badgeH * 0.3)

  // Basit ev ikonu SVG path (video'daki gibi)
  const iX = padX
  const iY = padY
  const houseIcon = `<g transform="translate(${iX},${iY}) scale(${iconS / 24})" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 20V9.5z"/>
    <polyline points="9 21.5 9 12 15 12 15 21.5"/>
  </g>`

  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${badgeW}" height="${badgeH}">
    <rect x="0" y="0" width="${badgeW}" height="${badgeH}" rx="${rx}" ry="${rx}" fill="rgba(0,0,0,0.5)"/>
    ${houseIcon}
    <text x="${padX + iconS + gap}" y="${badgeH * 0.67}" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="700" fill="white" letter-spacing="1">
      <tspan fill="#b39345">URLA</tspan><tspan fill="white">STONE</tspan>
    </text>
  </svg>`)

  return { svg, badgeW, badgeH }
}

/**
 * Add URLASTONE watermark to image buffer
 */
export async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata()
  const imgW = metadata.width || 1600
  const imgH = metadata.height || 1200

  const { svg: watermarkSvg, badgeW, badgeH } = createWatermarkSvg(imgW)
  const margin = Math.round(Math.min(imgW, imgH) * 0.025)

  const result = await sharp(imageBuffer)
    .composite([
      {
        input: watermarkSvg,
        top: margin,
        left: imgW - margin - badgeW,
      },
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
