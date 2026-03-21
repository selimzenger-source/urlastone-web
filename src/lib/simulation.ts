// AI Simulation types and utilities

export type SimStep = 'upload' | 'select' | 'mode' | 'mask' | 'processing' | 'result'

// Apply mode: full surface (FLUX Canny) vs brush selection (SD Inpainting)
export type ApplyMode = 'full' | 'brush'

// Surface context for intelligent prompt building
export type SurfaceContext = 'facade' | 'fireplace' | 'bathroom' | 'interior' | 'floor'

export interface SimState {
  step: SimStep
  imageDataUrl: string | null
  imageWidth: number
  imageHeight: number
  selectedStone: StoneOption | null
  applyMode: ApplyMode | null
  surfaceContext: SurfaceContext | null
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
// IMPORTANT: Each pattern must be very distinct and specific so AI doesn't confuse them
const CATEGORY_PATTERN: Record<string, string> = {
  nature: 'LARGE irregular polygonal shaped flat stone pieces fitted together like a jigsaw puzzle, each stone piece is 15-30cm wide with natural broken rough edges, thick dark grout lines between stones, random organic arrangement NOT horizontal lines NOT bricks, stones are BIG chunky flat pieces with rounded organic shapes, rustic rubble stone wall pattern, fieldstone masonry appearance',
  mix: 'combination of thin horizontal cut strips alternating with medium rounded natural pieces, mixed pattern with both linear strips and organic shapes together, balanced modern-rustic blend',
  crazy: 'random mosaic of many small irregular stone pieces in chaotic artistic pattern, mixed sizes from 3cm to 15cm, bold random placement like broken tile mosaic, dynamic texture with varying thickness',
  line: 'thin uniform horizontal stone strips each exactly 3cm height, clean precise parallel lines running left to right, modern minimalist linear pattern, contemporary sleek horizontal arrangement like stacked thin slabs',
}

// Surface context prompts — what to apply stone TO and what to PRESERVE
const SURFACE_CONTEXT: Record<SurfaceContext, { apply: string; preserve: string }> = {
  facade: {
    apply: 'all exterior wall surfaces and columns fully covered with natural stone cladding, complete stone coverage on walls pillars and facade surfaces, no bare plaster or concrete remaining on wall areas',
    preserve: 'absolutely preserve windows glass, doors, roof, sky, ground, vegetation, stairs, railings, garage doors exactly as original, do not apply stone to non-wall elements',
  },
  fireplace: {
    apply: 'entire fireplace area fully covered with natural stone, fireplace surround mantel chimney breast and hearth all completely clad with stone, no bare plaster remaining, full stone coverage on all fireplace surfaces',
    preserve: 'preserve furniture, floor, ceiling, room interior elements',
  },
  bathroom: {
    apply: 'all bathroom wall surfaces fully covered with natural stone tiles from floor to ceiling, every wall completely clad with stone, no bare surfaces remaining, full stone tile coverage on all vertical surfaces',
    preserve: 'preserve toilet, sink, mirror, fixtures, bathtub, shower glass, floor',
  },
  interior: {
    apply: 'all interior wall surfaces fully covered with natural stone cladding, every visible wall completely clad with stone from floor to ceiling, no bare plaster or paint remaining, full coverage stone installation',
    preserve: 'preserve furniture, windows, doors, ceiling, floor, decorations',
  },
  floor: {
    apply: 'entire floor surface fully paved with natural stone tiles, complete stone coverage on all floor areas, no bare concrete remaining',
    preserve: 'preserve walls, furniture, fixtures, doors',
  },
}

// Build the optimal prompt based on stone type + category (for BRUSH mode inpainting)
export function buildPrompt(stoneCode: string, categorySlug?: string): string {
  const stoneBase = STONE_BASE[stoneCode] || STONE_BASE.TRV
  const pattern = categorySlug ? CATEGORY_PATTERN[categorySlug] : CATEGORY_PATTERN.nature

  return `${stoneBase}, ${pattern || ''}, exterior wall facade cladding, seamless professional installation, grouted joints, ${QUALITY}`
}

// Build prompt for FULL APPLY mode (FLUX Canny) — context-aware
export function buildFullApplyPrompt(stoneCode: string, categorySlug?: string, surfaceContext?: SurfaceContext): string {
  const stoneBase = STONE_BASE[stoneCode] || STONE_BASE.TRV
  const pattern = categorySlug ? CATEGORY_PATTERN[categorySlug] : CATEGORY_PATTERN.nature
  const context = surfaceContext ? SURFACE_CONTEXT[surfaceContext] : SURFACE_CONTEXT.facade

  return `${context.apply}, ${stoneBase}, ${pattern || ''}, seamless professional installation, grouted joints, ${context.preserve}, no text, no watermark, no logo, no brand, no writing, no letters, no words, clean image, ${QUALITY}`
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
        dataUrl: canvas.toDataURL('image/jpeg', 0.85),
        width,
        height,
      })
    }
    img.src = dataUrl
  })
}
