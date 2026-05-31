'use client'

import { useEffect, useState } from 'react'
import { X, ArrowUpRight } from 'lucide-react'

const SEEN_KEY = 'urlastone-klinker-promo-v1'

export default function KlinkerPromo() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let seen = false
    try { seen = localStorage.getItem(SEEN_KEY) === '1' } catch {}
    if (seen) return
    // ilk girişte kısa gecikmeyle göster (sayfa otursun)
    const tmr = setTimeout(() => setShow(true), 1200)
    return () => clearTimeout(tmr)
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(SEEN_KEY, '1') } catch {}
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,5,0.78)', backdropFilter: 'blur(6px)' }}
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[360px] max-h-[90vh] flex flex-col rounded-3xl overflow-hidden border border-[#d2613a]/30 bg-[#0c0a08] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close — always visible top-right */}
        <button
          onClick={dismiss}
          aria-label="Kapat"
          className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/55 backdrop-blur flex items-center justify-center text-white hover:bg-black/75 transition-colors"
        >
          <X size={20} />
        </button>

        {/* video — square, fits within viewport */}
        <video
          className="w-full block bg-black shrink-0 object-cover aspect-square"
          style={{ maxHeight: '52vh' }}
          autoPlay
          muted
          playsInline
          preload="metadata"
          poster="/klinker-promo-poster.jpg"
        >
          <source src="/klinker-promo.mp4" type="video/mp4" />
        </video>

        {/* copy + actions */}
        <div className="p-5 text-center shrink-0 overflow-y-auto">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#e8a786] mb-2">
            URLASTONE GROUP
          </p>
          <h3 className="font-heading text-2xl font-bold text-white leading-tight mb-2">
            URLA artık <span className="text-[#d2613a]">KLİNKER</span>&apos;de de hizmetinizde
          </h3>
          <p className="text-white/55 text-[13px] leading-relaxed mb-5 font-mono">
            El yapımı klinker tuğla — dış cephe, iç mekan ve peyzaj için. Detaylarını keşfedin.
          </p>
          <div className="flex flex-col gap-2.5">
            <a
              href="https://urlaklinker.com"
              target="_blank"
              rel="noopener"
              onClick={dismiss}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#d2613a] hover:bg-[#b84e2c] text-white font-medium text-sm transition-colors"
            >
              Siteyi Ziyaret Et
              <ArrowUpRight size={16} />
            </a>
            <button
              onClick={dismiss}
              className="text-white/45 hover:text-white/70 text-[13px] font-mono py-1.5 transition-colors"
            >
              Atla
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
