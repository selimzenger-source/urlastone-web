'use client'

// ─────────────────────────────────────────────────────────────────────────────
// URLA STONE — ProcessSection v3 (mobile-optimized, ref-based DOM updates)
//
// Performance: setState SADECE step değişirken çağrılır (4×/döngü). Sürekli
// değerler (progress, transform, opacity) doğrudan DOM'a refs üzerinden yazılır
// → React render cycle bypass → mobilde pürüzsüz.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

const STEP_DURS = [2800, 2800, 2800, 4600] as const
const STEP_OFFSETS = STEP_DURS.reduce<number[]>((acc, d) => {
  acc.push((acc[acc.length - 1] ?? 0) + d)
  return acc
}, [])
const TOTAL = STEP_OFFSETS[STEP_OFFSETS.length - 1]!

const REGIONS = [
  { name: 'leftBaseShort',  poly: 'polygon(8% 50%, 32% 50%, 32% 95%, 8% 95%)',                                              step: 1 },
  { name: 'rightBaseShort', poly: 'polygon(68% 50%, 92% 50%, 92% 95%, 68% 95%)',                                            step: 1 },
  { name: 'leftWallFull',   poly: 'polygon(8% 25%, 32% 25%, 32% 95%, 8% 95%)',                                              step: 2 },
  { name: 'rightWallFull',  poly: 'polygon(68% 25%, 92% 25%, 92% 95%, 68% 95%)',                                            step: 2 },
  { name: 'archTop',        poly: 'polygon(32% 25%, 68% 25%, 68% 50%, 60% 45%, 50% 42%, 40% 45%, 32% 50%)',                step: 2 },
  { name: 'gableRoof',      poly: 'polygon(32% 25%, 50% 5%, 68% 25%)',                                                      step: 3 },
] as const

function clamp(v: number) { return Math.max(0, Math.min(1, v)) }
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }

export default function ProcessSection() {
  const { t } = useLanguage()
  const [step, setStep] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  // Animated DOM nodes
  const rubbleRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const regionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const wordmarkBoxRef = useRef<HTMLDivElement>(null)
  const wordmarkRuleRef = useRef<HTMLDivElement>(null)
  const wordmarkTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setStep(3); return }

    const sec = sectionRef.current
    if (!sec) return

    let raf = 0
    let lastStep = -1
    let isVisible = false
    let startOffset = 0
    let pauseTime = 0

    const tick = (now: number) => {
      if (!isVisible) return
      const elapsed = (now - startOffset) % TOTAL
      let s = 0, stepStart = 0
      for (let i = 0; i < STEP_DURS.length; i++) {
        if (elapsed < STEP_OFFSETS[i]!) {
          s = i
          stepStart = i === 0 ? 0 : STEP_OFFSETS[i - 1]!
          break
        }
      }
      const p = (elapsed - stepStart) / STEP_DURS[s]

      if (s !== lastStep) { lastStep = s; setStep(s) }

      // Direct DOM updates — bypass React render
      applyVisualFrame(s, p, { rubbleRef, glowRef, regionRefs, wordmarkBoxRef, wordmarkRuleRef, wordmarkTextRef })

      raf = requestAnimationFrame(tick)
    }

    const start = (resume = false) => {
      if (isVisible) return
      isVisible = true
      const now = performance.now()
      startOffset = resume && pauseTime > 0 ? now - pauseTime : now
      pauseTime = 0
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      if (!isVisible) return
      isVisible = false
      pauseTime = (performance.now() - startOffset) % TOTAL
      cancelAnimationFrame(raf)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && document.visibilityState === 'visible') start(true)
        else stop()
      },
      { threshold: 0.15 }
    )
    observer.observe(sec)

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') stop()
      else {
        const r = sec.getBoundingClientRect()
        if (r.bottom > 0 && r.top < window.innerHeight) start(true)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(raf)
    }
  }, [])

  const steps = [
    { tag: t.process_step1_tag, title: t.process_step1_title, desc: t.process_step1_desc },
    { tag: t.process_step2_tag, title: t.process_step2_title, desc: t.process_step2_desc },
    { tag: t.process_step3_tag, title: t.process_step3_title, desc: t.process_step3_desc },
    { tag: t.process_step4_tag, title: t.process_step4_title, desc: t.process_step4_desc },
  ]

  return (
    <section
      ref={sectionRef}
      className="section-padding border-t border-white/[0.06] overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1510 50%, #0a0a0a 100%)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 md:mb-14">
          <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
            {t.process_tag}
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            {t.process_title}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Sol: Step metni */}
          <div className="relative" style={{ minHeight: 220 }}>
            {steps.map((s, i) => (
              <div
                key={i}
                className="absolute inset-0"
                style={{
                  opacity: step === i ? 1 : 0,
                  transform: step === i ? 'translateY(0)' : 'translateY(12px)',
                  transition: 'opacity 600ms ease, transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                  pointerEvents: step === i ? 'auto' : 'none',
                  willChange: 'opacity, transform',
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-mono text-[11px] tracking-[0.18em] text-gold-400 font-medium">
                    {String(i + 1).padStart(2, '0')} / 04
                  </span>
                  <span className="h-px w-8 flex-shrink-0" style={{ background: 'linear-gradient(90deg, rgba(179,147,69,0.5), transparent)' }} />
                  <span className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">{s.tag}</span>
                </div>
                <h3 className="text-white font-heading text-xl md:text-2xl lg:text-3xl font-semibold mt-3 mb-4 leading-tight">
                  {s.title}
                </h3>
                <p className="text-white/55 text-sm md:text-base font-body leading-relaxed max-w-md">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Sağ: Görsel kare */}
          <div className="flex justify-center">
            <div
              style={{
                position: 'relative',
                width: 'min(360px, 80%)',
                aspectRatio: '1 / 1',
              }}
            >
              {/* Ambient gold glow */}
              <div
                ref={glowRef}
                style={{
                  position: 'absolute', inset: '-15%',
                  background: 'radial-gradient(circle at 50% 50%, rgba(214,184,120,0.04) 0%, transparent 65%)',
                  filter: 'blur(20px)',
                  pointerEvents: 'none',
                  willChange: 'background',
                }}
              />

              {/* Floor shadow */}
              <div
                style={{
                  position: 'absolute', bottom: '18%', left: '20%', right: '20%',
                  height: 14,
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
                  filter: 'blur(8px)',
                }}
              />

              {/* Rubble pile */}
              <div
                ref={rubbleRef}
                style={{
                  position: 'absolute', inset: '0 0 18% 0',
                  opacity: 1,
                  transform: 'translate3d(0,0,0) scale(1)',
                  willChange: 'transform, opacity',
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ position: 'relative', width: '70%', height: '70%' }}>
                  <Image src="/logo-rubble-v2.png" alt="Taş yığını" fill className="object-contain object-bottom" />
                </div>
              </div>

              {/* Logo regions */}
              {REGIONS.map(r => (
                <div
                  key={r.name}
                  ref={el => { regionRefs.current[r.name] = el }}
                  style={{
                    position: 'absolute', inset: '0 0 18% 0',
                    clipPath: r.poly,
                    opacity: 0,
                    transform: 'translate3d(0, 36px, 0) scale(0.85)',
                    transformOrigin: '50% 100%',
                    pointerEvents: 'none',
                    willChange: 'transform, opacity',
                    display: 'none',
                  }}
                >
                  <Image src="/logo-outline.png" alt="" fill className="object-contain" />
                </div>
              ))}

              {/* Wordmark — görsel karenin içinde alt kısımda, çakışma yok */}
              <div
                ref={wordmarkBoxRef}
                style={{
                  position: 'absolute',
                  left: 0, right: 0, bottom: '6%',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  display: 'none',
                }}
              >
                <div
                  ref={wordmarkRuleRef}
                  style={{
                    width: 60, height: 1, margin: '0 auto 14px',
                    background: 'linear-gradient(90deg, transparent, #b39345, transparent)',
                    transform: 'scaleX(0)', opacity: 0,
                    willChange: 'transform, opacity',
                  }}
                />
                <div
                  ref={wordmarkTextRef}
                  style={{
                    fontFamily: 'var(--font-heading, "Playfair Display", serif)',
                    fontWeight: 600,
                    fontSize: 'clamp(16px, 2vw, 24px)',
                    letterSpacing: '0.18em',
                    opacity: 0,
                    transform: 'translate3d(0, 8px, 0)',
                    willChange: 'transform, opacity',
                  }}
                >
                  <span style={{ color: '#b39345' }}>URLA</span>
                  <span style={{ color: '#fff', marginLeft: '0.18em' }}>STONE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── DOM updater (RAF içinden çağrılır, React'a hiç dokunmaz) ─────────────
function applyVisualFrame(
  step: number,
  progress: number,
  refs: {
    rubbleRef: React.RefObject<HTMLDivElement>
    glowRef: React.RefObject<HTMLDivElement>
    regionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
    wordmarkBoxRef: React.RefObject<HTMLDivElement>
    wordmarkRuleRef: React.RefObject<HTMLDivElement>
    wordmarkTextRef: React.RefObject<HTMLDivElement>
  }
) {
  const { rubbleRef, glowRef, regionRefs, wordmarkBoxRef, wordmarkRuleRef, wordmarkTextRef } = refs

  // Rubble
  const rubbleOp = step === 0 ? 1 : step === 1 ? Math.max(0, 1 - progress * 1.6) : 0
  const rubbleY = step === 1 ? -progress * 30 : 0
  const rubbleScale = step === 1 ? 1 - progress * 0.15 : 1
  if (rubbleRef.current) {
    rubbleRef.current.style.opacity = String(rubbleOp)
    rubbleRef.current.style.transform = `translate3d(0, ${rubbleY}px, 0) scale(${rubbleScale})`
  }

  // Final pulse — daha güçlü, sürekli hold
  const finalPulse = step === 3
    ? (progress < 0.20 ? clamp(progress / 0.20)
        : progress < 0.85 ? 1
        : clamp(1 - (progress - 0.85) / 0.15))
    : 0

  // Ambient glow — sıcak halo
  if (glowRef.current) {
    const a = 0.04 + (step >= 2 ? 0.06 : 0) + finalPulse * 0.18
    glowRef.current.style.background =
      `radial-gradient(circle at 50% 55%, rgba(214,184,120,${a}) 0%, transparent 65%)`
  }

  // Regions
  for (const r of REGIONS) {
    const el = regionRefs.current[r.name]
    if (!el) continue
    const show = step >= r.step
    if (!show) {
      el.style.display = 'none'
      continue
    }
    el.style.display = ''

    const seed = r.name.charCodeAt(0) + r.name.charCodeAt(1)
    const delay = (seed % 7) / 30
    const local = step > r.step ? 1 : clamp((progress - delay) / 0.55)
    const ease = easeOutCubic(local)

    const ty = (1 - ease) * 36
    const scale = 0.85 + ease * 0.15

    el.style.opacity = String(ease)
    el.style.transform = `translate3d(0, ${ty}px, 0) scale(${scale})`
    el.style.filter = 'none'
  }

  // Wordmark (step 3 only)
  if (step === 3) {
    if (wordmarkBoxRef.current) wordmarkBoxRef.current.style.display = ''
    const wordmarkP = clamp((progress - 0.30) / 0.25) * (progress < 0.92 ? 1 : 1 - (progress - 0.92) / 0.08)

    if (wordmarkRuleRef.current) {
      wordmarkRuleRef.current.style.transform = `scaleX(${wordmarkP})`
      wordmarkRuleRef.current.style.opacity = String(wordmarkP)
    }
    if (wordmarkTextRef.current) {
      wordmarkTextRef.current.style.opacity = String(wordmarkP)
      wordmarkTextRef.current.style.transform = `translate3d(0, ${(1 - wordmarkP) * 8}px, 0)`
    }
  } else {
    if (wordmarkBoxRef.current) wordmarkBoxRef.current.style.display = 'none'
  }
}
