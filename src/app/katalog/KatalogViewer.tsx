'use client'

import { useCallback, useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useLanguage } from '@/context/LanguageContext'
import { ChevronLeft, ChevronRight, Download, Maximize2, X } from 'lucide-react'

const TOTAL = 26
const pad = (n: number) => n.toString().padStart(2, '0')
const PDF = '/katalog.pdf'

const COPY: Record<string, { eyebrow: string; title: string; sub: string; download: string; page: string; tapHint: string }> = {
  tr: { eyebrow: 'KATALOG', title: 'Doğal Taş Koleksiyonu', sub: 'Tüm doğal taş serilerimizi sayfa sayfa inceleyin ya da PDF olarak indirin.', download: 'PDF İndir', page: 'Sayfa', tapHint: 'Tam ekran için görsele dokunun' },
  en: { eyebrow: 'CATALOGUE', title: 'Natural Stone Collection', sub: 'Browse our full natural stone collection page by page or download the PDF.', download: 'Download PDF', page: 'Page', tapHint: 'Tap the image for fullscreen' },
}

export default function KatalogViewer() {
  const { locale } = useLanguage()
  const c = COPY[locale] || COPY.en
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(false)
  const src = (n: number) => `/katalog/pages/p${pad(n)}.webp?v=2`

  const go = useCallback((d: number) => setPage(p => Math.min(TOTAL, Math.max(1, p + d))), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Escape') setZoom(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  useEffect(() => {
    ;[page + 1, page - 1].forEach(n => { if (n >= 1 && n <= TOTAL) { const im = new Image(); im.src = src(n) } })
  }, [page])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-mono text-[11px] tracking-[0.4em] text-gold-400 uppercase">{c.eyebrow}</span>
            <h1 className="font-heading text-3xl md:text-5xl font-medium mt-3 mb-4">{c.title}</h1>
            <p className="text-white/50 text-sm md:text-base leading-relaxed">{c.sub}</p>
            <a href={PDF} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-gold-400 text-black font-mono text-xs tracking-[0.14em] uppercase hover:bg-[#d2b96e] transition-colors">
              <Download size={15} /> {c.download}
            </a>
          </div>

          {/* Stage */}
          <div className="relative w-[min(640px,94vw)] mx-auto flex items-center justify-center">
            <button onClick={() => setZoom(true)} className="relative group cursor-zoom-in leading-none w-full flex justify-center" aria-label="zoom">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={page} src={src(page)} alt={`${c.page} ${page}`}
                className="w-full max-w-[600px] h-auto block rounded-lg shadow-2xl bg-white" />
              <span className="absolute right-3 bottom-3 w-9 h-9 rounded-full bg-black/55 backdrop-blur flex items-center justify-center text-white opacity-85 group-hover:opacity-100 transition-opacity"><Maximize2 size={16} /></span>
            </button>
            <button onClick={() => go(-1)} disabled={page === 1} aria-label="prev"
              className="absolute left-1 sm:-left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/15 bg-black/45 backdrop-blur flex items-center justify-center text-white hover:bg-gold-400 hover:text-black hover:border-gold-400 transition-colors disabled:opacity-25 disabled:pointer-events-none">
              <ChevronLeft size={22} />
            </button>
            <button onClick={() => go(1)} disabled={page === TOTAL} aria-label="next"
              className="absolute right-1 sm:-right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/15 bg-black/45 backdrop-blur flex items-center justify-center text-white hover:bg-gold-400 hover:text-black hover:border-gold-400 transition-colors disabled:opacity-25 disabled:pointer-events-none">
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Counter + tap hint */}
          <div className="text-center mt-5 mb-2 font-mono text-[13px] tracking-[0.3em] text-white/45">
            {pad(page)} <span className="text-gold-400">/</span> {TOTAL}
          </div>
          <div className="text-center mb-7 font-mono text-[10px] tracking-[0.2em] uppercase text-white/30">{c.tapHint}</div>

          {/* Thumbnails */}
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {Array.from({ length: TOTAL }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`relative rounded overflow-hidden border transition-all ${n === page ? 'border-gold-400 -translate-y-0.5' : 'border-white/10 hover:border-white/30'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src(n)} alt="" loading="lazy" className="w-full h-auto block bg-white" />
                <span className="absolute left-1 bottom-1 font-mono text-[7px] px-1 rounded bg-black/55 text-white">{pad(n)}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {zoom && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-1" onClick={() => setZoom(false)}>
          <button className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-gold-400 hover:text-black" onClick={() => setZoom(false)}><X size={24} /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src(page)} alt={`${c.page} ${page}`} className="max-w-[98vw] max-h-[92vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); go(-1) }} disabled={page === 1} aria-label="prev" className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/15 bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-gold-400 hover:text-black disabled:opacity-25 disabled:pointer-events-none"><ChevronLeft size={24} /></button>
          <button onClick={(e) => { e.stopPropagation(); go(1) }} disabled={page === TOTAL} aria-label="next" className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/15 bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-gold-400 hover:text-black disabled:opacity-25 disabled:pointer-events-none"><ChevronRight size={24} /></button>
          <div className="absolute bottom-4 left-0 right-0 text-center font-mono text-xs tracking-[0.3em] text-white/60">{pad(page)} <span className="text-gold-400">/</span> {TOTAL}</div>
        </div>
      )}

      <Footer />
    </>
  )
}
