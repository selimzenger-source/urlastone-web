// AI Simulation types and utilities

export type SimStep = 'upload' | 'select' | 'mask' | 'processing' | 'result'

export interface SimState {
  step: SimStep
  imageDataUrl: string | null
  imageWidth: number
  imageHeight: number
  selectedStone: StoneOption | null
  maskDataUrl: string | null
  predictionId: string | null
  resultUrl: string | null
  error: string | null
}

export interface StoneOption {
  code: string
  name: string
  image_url: string | null
  categorySlug?: string
}

// Base quality suffix for all prompts
const QUALITY = 'ultra realistic, architectural photography, 8k, photorealistic lighting, natural daylight, professional construction, real building exterior, depth of field, shot on Canon EOS R5'

// Stone type base textures
const STONE_BASE: Record<string, string> = {
  TRV: 'travertine natural stone, warm cream ivory beige tones, natural porous honeycomb texture with filled holes, subtle earth-tone veining, matte honed finish, Denizli travertine from Turkey',
  MRMR: 'marble natural stone, elegant white cream with grey brown veining, crystalline structure, semi-polished smooth finish, Turkish Afyon marble',
  BZLT: 'basalt natural stone, dark charcoal grey to deep black, dense volcanic texture, uniform fine grain, split face rough finish, Anatolian basalt',
  KLKR: 'limestone natural stone, warm sandy beige to cream white, fine grain soft sedimentary texture, matte natural finish, Turkish limestone',
}

// Rockshell category patterns (how stones are arranged)
const CATEGORY_PATTERN: Record<string, string> = {
  nature: 'irregular organic random shaped pieces, natural broken edges, rustic stacked arrangement, varying sizes mixed together, no two pieces alike, authentic quarry-cut appearance',
  mix: 'combination of horizontal thin cut strips mixed with natural rounded pieces, balanced modern-traditional blend, geometric meets organic pattern',
  crazy: 'random mosaic pattern, mixed shapes and sizes, chaotic artistic arrangement, varying thickness, bold irregular placement, dynamic visual texture',
  line: 'uniform 3cm height horizontal strips, clean parallel lines, free-length pieces, minimal modern linear pattern, precise contemporary arrangement',
}

// Build the optimal prompt based on stone type + category
export function buildPrompt(stoneCode: string, categorySlug?: string): string {
  const stoneBase = STONE_BASE[stoneCode] || STONE_BASE.TRV
  const pattern = categorySlug ? CATEGORY_PATTERN[categorySlug] : CATEGORY_PATTERN.nature

  return `${stoneBase}, ${pattern || ''}, exterior wall facade cladding, seamless professional installation, grouted joints, ${QUALITY}`
}

// Fallback simple prompts for unknown codes
export const stonePrompts: Record<string, { prompt: string; label: string }> = {
  TRV: { prompt: buildPrompt('TRV', 'nature'), label: 'Traverten' },
  MRMR: { prompt: buildPrompt('MRMR', 'nature'), label: 'Mermer' },
  BZLT: { prompt: buildPrompt('BZLT', 'nature'), label: 'Bazalt' },
  KLKR: { prompt: buildPrompt('KLKR', 'nature'), label: 'Kalker' },
}

export const negativePrompt = 'cartoon, drawing, painting, illustration, anime, sketch, low quality, blurry, distorted, text, watermark, logo, artifact, deformed, ugly, duplicate, morbid, bad anatomy, extra limbs, mutated, disfigured, flat texture, repeating tile pattern, wallpaper, digital render, 3d render, CGI'

// Resize image to max dimension while keeping aspect ratio
export function resizeImage(
  dataUrl: string,
  maxSize: number = 1024
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height / width) * maxSize)
          width = maxSize
        } else {
          width = Math.round((width / height) * maxSize)
          height = maxSize
        }
      }
      // Ensure dimensions are divisible by 8 (required by SD)
      width = Math.round(width / 8) * 8
      height = Math.round(height / 8) * 8

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        width,
        height,
      })
    }
    img.src = dataUrl
  })
}
