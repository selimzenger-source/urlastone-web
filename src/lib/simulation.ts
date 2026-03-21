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
}

// Stone-specific prompts for inpainting - architectural photography quality
export const stonePrompts: Record<string, { prompt: string; label: string }> = {
  TRV: {
    prompt: 'travertine natural stone wall cladding, warm cream beige color, natural porous texture with subtle veining, high quality architectural photography, realistic stone surface, professional masonry, seamless natural stone installation',
    label: 'Traverten',
  },
  MRMR: {
    prompt: 'marble natural stone surface, elegant white and grey veining pattern, polished smooth finish, luxury architectural cladding, high quality photography, realistic marble texture, professional stone installation',
    label: 'Mermer',
  },
  BZLT: {
    prompt: 'basalt natural stone cladding, dark grey to black volcanic stone, uniform dense texture, modern architectural facade, high quality photography, realistic basalt surface, professional masonry installation',
    label: 'Bazalt',
  },
  KLKR: {
    prompt: 'limestone natural stone wall, warm beige to cream color, fine grain soft texture, elegant architectural cladding, high quality photography, realistic limestone surface, professional stone installation',
    label: 'Kalker',
  },
}

export const negativePrompt = 'cartoon, drawing, painting, illustration, anime, sketch, low quality, blurry, distorted, text, watermark, logo, artifact, deformed, ugly, duplicate, morbid'

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
