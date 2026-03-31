/**
 * Client-side watermark — Canvas API ile (tarayıcıda font var, sorunsuz çalışır)
 * Simülasyondaki drawWatermarks ile aynı yaklaşım
 */

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number, logoImg: HTMLImageElement | null) {
  ctx.save()

  const fontSize = Math.max(14, Math.round(Math.min(width, height) * 0.018))
  const pad = fontSize * 0.8
  const margin = fontSize * 1.2

  // Measure text
  ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`
  const mainWidth = ctx.measureText('URLASTONE').width

  const logoW = logoImg ? fontSize * 1.3 : 0
  const logoGap = logoImg ? pad * 0.5 : 0
  const badgeW = pad + logoW + logoGap + mainWidth + pad
  const badgeH = pad * 2 + fontSize
  const badgeX = width - margin - badgeW
  const badgeY = margin

  // Rounded rect background
  ctx.globalAlpha = 0.5
  ctx.fillStyle = '#000000'
  const r = badgeH * 0.3
  ctx.beginPath()
  ctx.moveTo(badgeX + r, badgeY)
  ctx.lineTo(badgeX + badgeW - r, badgeY)
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + r)
  ctx.lineTo(badgeX + badgeW, badgeY + badgeH - r)
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - r, badgeY + badgeH)
  ctx.lineTo(badgeX + r, badgeY + badgeH)
  ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - r)
  ctx.lineTo(badgeX, badgeY + r)
  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + r, badgeY)
  ctx.fill()

  // Logo
  let contentX = badgeX + pad
  if (logoImg) {
    const logoH = logoW
    ctx.globalAlpha = 0.9
    ctx.drawImage(logoImg, contentX, badgeY + (badgeH - logoH) / 2, logoW, logoH)
    contentX += logoW + logoGap
  }

  // "URLA" gold + "STONE" white
  ctx.globalAlpha = 0.95
  ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  ctx.fillStyle = '#b39345'
  ctx.fillText('URLA', contentX, badgeY + pad)
  const urlaW = ctx.measureText('URLA').width

  ctx.fillStyle = '#ffffff'
  ctx.fillText('STONE', contentX + urlaW, badgeY + pad)

  ctx.restore()
}

/**
 * Fotoğrafa client-side watermark ekle
 * Returns: watermarked File object
 */
export async function addClientWatermark(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const logoImg = new Image()
    logoImg.crossOrigin = 'anonymous'
    logoImg.src = '/ur2-dark.png'

    img.onload = () => {
      // Max 1920px resize
      const maxW = 1920
      const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1
      const w = Math.round(img.naturalWidth * scale)
      const h = Math.round(img.naturalHeight * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)

      // Draw watermark
      const logo = logoImg.complete && logoImg.naturalWidth > 0 ? logoImg : null
      drawWatermark(ctx, w, h, logo)

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
        } else {
          resolve(file)
        }
      }, 'image/jpeg', 0.85)
    }

    img.onerror = () => resolve(file)
    img.src = URL.createObjectURL(file)
  })
}
