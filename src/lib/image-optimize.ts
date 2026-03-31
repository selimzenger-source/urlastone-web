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
function createWatermarkSvg(imgWidth: number): { svg: Buffer; badgeW: number; badgeH: number; iconS: number; padX: number; padY: number } {
  // "URLASTONE" harfleri SVG path olarak — font bağımlılığı yok
  // Her harf 100 birim genişliğinde viewBox'ta tasarlandı, scale ile boyutlandırılır
  // Bold sans-serif stil
  const letterPaths: Record<string, { d: string; w: number }> = {
    U: { d: 'M12 4v50c0 18 10 26 28 26s28-8 28-26V4h16v52c0 30-18 48-44 48S0 86 0 56V4h12z', w: 84 },
    R: { d: 'M12 4h36c24 0 38 12 38 32 0 16-9 27-24 31l28 33h-18L46 69H28v31H12V4zm16 14v38h20c16 0 24-8 24-19s-8-19-24-19H28z', w: 86 },
    L: { d: 'M12 4h16v82h50v14H12V4z', w: 78 },
    A: { d: 'M34 4h12l38 96H68L58 74H22L12 100H-4L34 4zm20 56L40 20 26 60h28z', w: 80 },
    S: { d: 'M68 28c-2-14-12-22-28-22-14 0-24 6-24 18 0 12 10 16 26 20 22 6 40 14 40 36 0 26-20 40-44 40C14 120-2 106 0 80h16c0 18 12 28 30 28 16 0 28-8 28-22 0-14-10-18-28-22-22-6-38-14-38-34C8 6 26-6 42-6c24 0 40 14 42 34H68z', w: 78 },
    T: { d: 'M32 4h16v82h-16V18H0V4h96v14H32z', w: 72 },
    O: { d: 'M48 0c30 0 50 22 50 52s-20 52-50 52S-2 82-2 52 18 0 48 0zm0 14c-22 0-34 16-34 38s12 38 34 38 34-16 34-38-12-38-34-38z', w: 96 },
    N: { d: 'M12 4h14l48 68V4h16v96H76L28 32v68H12V4z', w: 90 },
    E: { d: 'M12 4h64v14H28v28h44v14H28v28h50v14H12V4z', w: 78 },
  }

  const scale = Math.max(0.18, Math.min(0.36, imgWidth * 0.00022))
  const spacing = 1
  const padX = Math.round(14 * scale)
  const padY = Math.round(10 * scale)

  const textH = Math.round(100 * scale)
  // Logo için alan ayır (text yüksekliğiyle eşleşir)
  const iconS = textH
  const iconGap = Math.round(6 * scale)

  // Harf genişliklerini hesapla
  const word = 'URLASTONE'
  let totalTextW = 0
  for (const ch of word) {
    totalTextW += Math.round(letterPaths[ch].w * scale) + spacing
  }
  totalTextW -= spacing

  const badgeW = padX + iconS + iconGap + totalTextW + padX
  const badgeH = padY * 2 + textH
  const rx = Math.round(badgeH * 0.3)

  // Harfleri path olarak oluştur (font bağımlılığı yok)
  let textPaths = ''
  let cx = padX + iconS + iconGap
  let charIndex = 0
  for (const ch of word) {
    const lp = letterPaths[ch]
    const color = charIndex < 4 ? '#b39345' : 'white'
    textPaths += `<g transform="translate(${cx},${padY}) scale(${scale})"><path d="${lp.d}" fill="${color}"/></g>`
    cx += Math.round(lp.w * scale) + spacing
    charIndex++
  }

  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${badgeW}" height="${badgeH}">
    <rect x="0" y="0" width="${badgeW}" height="${badgeH}" rx="${rx}" ry="${rx}" fill="rgba(0,0,0,0.5)"/>
    ${textPaths}
  </svg>`)

  return { svg, badgeW, badgeH, iconS, padX, padY }
}

/**
 * Add URLASTONE watermark to image buffer
 */
export async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata()
  const imgW = metadata.width || 1600
  const imgH = metadata.height || 1200

  const { svg: watermarkSvg, badgeW, badgeH, iconS, padX, padY } = createWatermarkSvg(imgW)
  const margin = Math.round(Math.min(imgW, imgH) * 0.025)

  // Logo PNG'yi Sharp ile resize et (ur2-dark.png)
  const composites: sharp.OverlayOptions[] = [
    {
      input: watermarkSvg,
      top: margin,
      left: imgW - margin - badgeW,
    },
  ]

  try {
    const logoPath = path.join(process.cwd(), 'public', 'ur2-dark.png')
    if (fs.existsSync(logoPath)) {
      const logoBuffer = await sharp(logoPath)
        .resize(iconS, iconS, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
        .toBuffer()
      composites.push({
        input: logoBuffer,
        top: margin + padY,
        left: imgW - margin - badgeW + padX,
      })
    }
  } catch {
    // Logo yoksa sadece text badge
  }

  const result = await sharp(imageBuffer)
    .composite(composites)
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
