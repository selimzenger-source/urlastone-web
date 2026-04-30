'use client'

// ─────────────────────────────────────────────────────────────────────
// URLA STONE — Logo loader (AI simülasyonundaki ile aynı stil)
// Reusable: Instagram placeholder, ürün yükleme, vb. her yerde
// ─────────────────────────────────────────────────────────────────────

import Image from 'next/image'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const SIZES = {
  sm: { outer: 'w-16 h-16', logo: 'w-8 h-8' },
  md: { outer: 'w-24 h-24', logo: 'w-12 h-12' },
  lg: { outer: 'w-28 h-28', logo: 'w-14 h-14' },
} as const

export default function UrlastoneLoader({ size = 'md', label, className = '' }: Props) {
  const s = SIZES[size]
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${s.outer}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-400/20 to-gold-400/5 animate-pulse" />
        <div
          className="absolute inset-1 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin"
          style={{ animationDuration: '3s' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`relative ${s.logo}`}>
            <Image
              src="/logo-stone.png"
              alt="URLA STONE"
              fill
              className="object-contain rounded-lg opacity-90 animate-pulse"
              draggable={false}
            />
          </div>
        </div>
      </div>
      {label && (
        <p className="font-mono text-[10px] text-white/30 mt-4 tracking-[0.2em] uppercase animate-pulse">
          {label}
        </p>
      )}
    </div>
  )
}
