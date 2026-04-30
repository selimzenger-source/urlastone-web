'use client'

// ─────────────────────────────────────────────────────────────────────────────
// URLA STONE — ProcessSection (animated)
// 4 sahne, ~13s, sürekli döngü — scroll bağımsız RAF döngüsü
//
// Sahne 0 (TALEP):    Yıkık taş yığını → "Projenizi Dinliyoruz"
// Sahne 1 (TASARIM):  Rubble solar, iki yan duvar yükseliyor
// Sahne 2 (ÜRETİM):   Duvarlar uzuyor, kemer tamamlanıyor
// Sahne 3 (TESLİMAT): Çatı + tam logo + gold pulse + wordmark
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

// ── Timing ──────────────────────────────────────────────────────────────────
const STEP_DURS = [2800, 2800, 2800, 4600] as const
const STEP_OFFSETS = STEP_DURS.reduce<number[]>((acc, d) => {
  acc.push((acc[acc.length - 1] ?? 0) + d)
  return acc
}, [])
const TOTAL = STEP_OFFSETS[STEP_OFFSETS.length - 1]!

// ── Logo regions (clip-path polygons building a house silhouette) ─────────
const REGIONS: { name: string; poly: string; step: number }[] = [
  { name: 'leftBaseShort',  poly: 'polygon(8% 50%, 32% 50%, 32% 95%, 8% 95%)',                                             step: 1 },
  { name: 'rightBaseShort', poly: 'polygon(68% 50%, 92% 50%, 92% 95%, 68% 95%)',                                            step: 1 },
  { name: 'leftWallFull',   poly: 'polygon(8% 25%, 32% 25%, 32% 95%, 8% 95%)',                                              step: 2 },
  { name: 'rightWallFull',  poly: 'polygon(68% 25%, 92% 25%, 92% 95%, 68% 95%)',                                            step: 2 },
  { name: 'archTop',        poly: 'polygon(32% 25%, 68% 25%, 68% 50%, 60% 45%, 50% 42%, 40% 45%, 32% 50%)',                step: 2 },
  { name: 'gableRoof',      poly: 'polygon(32% 25%, 50% 5%, 68% 25%)',                                                      step: 3 },
]

// ── Dust particles (seeded, stable across renders) ───────────────────────
const DUST = (() => {
  const arr: { x: number; startY: number; size: number; shade: number; delay: number; drift: number; rot: number }[] = []
  let s = 73
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  for (let i = 0; i < 14; i++) {
    arr.push({ x: 20 + r() * 60, startY: 70 + r() * 20, size: 3 + r() * 7, shade: 0.6 + r() * 0.35, delay: r() * 0.4, drift: (r() - 0.5) * 25, rot: r() * 360 })
  }
  return arr
})()

// ── Helpers ──────────────────────────────────────────────────────────────
function clamp(v: number) { return Math.max(0, Math.min(1, v)) }
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }

// ── Sub-components ────────────────────────────────────────────────────────

const RisingDust = memo(function RisingDust({ step, progress }: { step: number; progress: number }) {
  const t =
    step === 0 ? Math.max(0, (progress - 0.7) / 0.3) * 0.3
    : step === 1 ? Math.min(1, progress / 0.6)
    : 0
  if (t <= 0) return null
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {DUST.map((d, i) => {
        const local = clamp((t - d.delay) / 0.7)
        if (local <= 0) return null
        const ease = easeOutCubic(local)
        const y = d.startY - ease * 60
        const x = d.x + d.drift * ease
        const opacity = local < 0.7 ? local : 1 - (local - 0.7) / 0.3
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`, top: `${y}%`,
              width: d.size, height: d.size * 0.85,
              transform: `translate(-50%, -50%) rotate(${d.rot + ease * 180}deg)`,
              opacity: clamp(opacity) * 0.7,
              background: `rgba(${230 - 20 * d.shade}, ${228 - 20 * d.shade}, ${220 - 20 * d.shade}, ${d.shade})`,
              borderRadius: '40%',
              boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.15)',
            }}
          />
        )
      })}
    </div>
  )
})

function ShineSweep({ progress }: { progress: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 0, bottom: 0, width: '50%',
          left: `${-50 + progress * 150}%`,
          background: 'linear-gradient(105deg, transparent 30%, rgba(255,235,180,0.45) 50%, transparent 70%)',
          mixBlendMode: 'screen',
          opacity: Math.sin(progress * Math.PI),
        }}
      />
    </div>
  )
}

const LogoRegion = memo(function LogoRegion({ name, poly, step: appearStep, activeStep, progress, finalPulse }: {
  name: string; poly: string; step: number; activeStep: number; progress: number; finalPulse: number
}) {
  if (activeStep < appearStep) return null
  const seed = name.charCodeAt(0) + name.charCodeAt(1)
  const delay = (seed % 7) / 30
  const local = activeStep > appearStep ? 1 : clamp((progress - delay) / 0.55)
  const ease = easeOutCubic(local)
  const goldMix = activeStep === 3 ? finalPulse : (activeStep > appearStep ? 0.15 : 0)
  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        clipPath: poly,
        opacity: ease,
        transform: `translateY(${(1 - ease) * 36}px) scale(${0.85 + ease * 0.15})`,
        transformOrigin: '50% 100%',
        pointerEvents: 'none',
        filter: `drop-shadow(0 0 ${4 + goldMix * 18}px rgba(179,147,69,${0.10 + goldMix * 0.45}))`,
        transition: 'filter 400ms ease',
      }}
    >
      <Image src="/logo-outline.png" alt="" fill className="object-contain" />
    </div>
  )
})

// ── Main Component ────────────────────────────────────────────────────────

export default function ProcessSection() {
  const { t } = useLanguage()
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number>(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setStep(3); setProgress(1); return }

    const sec = sectionRef.current
    if (!sec) return

    let isVisible = false
    let startOffset = 0
    let pauseTime = 0
    let lastUpdate = 0
    let lastStep = -1
    let lastP = -1
    const FRAME_MS = 33

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
      const stepChanged = s !== lastStep
      const progressChangedEnough = Math.abs(p - lastP) > 0.015
      if (stepChanged || (now - lastUpdate >= FRAME_MS && progressChangedEnough)) {
        if (stepChanged) setStep(s)
        setProgress(p)
        lastUpdate = now
        lastStep = s
        lastP = p
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    // Sadece görünürken çalış, scroll edilince dur
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && document.visibilityState === 'visible') {
          if (!isVisible) {
            isVisible = true
            const now = performance.now()
            // Pause ettiği yerden devam etsin
            startOffset = pauseTime > 0 ? now - pauseTime : now
            pauseTime = 0
            rafRef.current = requestAnimationFrame(tick)
          }
        } else if (isVisible) {
          isVisible = false
          // Mevcut elapsed'i sakla, sonra devam ettiğimizde aynı yerden başlasın
          pauseTime = (performance.now() - startOffset) % TOTAL
          cancelAnimationFrame(rafRef.current)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(sec)

    // Sekme arka plana geçince de durdur
    const onVisibility = () => {
      if (document.visibilityState !== 'visible' && isVisible) {
        isVisible = false
        pauseTime = (performance.now() - startOffset) % TOTAL
        cancelAnimationFrame(rafRef.current)
      } else if (document.visibilityState === 'visible') {
        // Görünürse ve section ekrandaysa observer zaten devam ettirir
        const rect = sec.getBoundingClientRect()
        const inView = rect.bottom > 0 && rect.top < window.innerHeight
        if (inView && !isVisible) {
          isVisible = true
          const now = performance.now()
          startOffset = pauseTime > 0 ? now - pauseTime : now
          pauseTime = 0
          rafRef.current = requestAnimationFrame(tick)
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const steps = [
    { tag: t.process_step1_tag, title: t.process_step1_title, desc: t.process_step1_desc },
    { tag: t.process_step2_tag, title: t.process_step2_title, desc: t.process_step2_desc },
    { tag: t.process_step3_tag, title: t.process_step3_title, desc: t.process_step3_desc },
    { tag: t.process_step4_tag, title: t.process_step4_title, desc: t.process_step4_desc },
  ]

  // Gold pulse (sahne 3)
  const finalPulse = step === 3
    ? (progress < 0.25 ? clamp(progress / 0.25) : progress < 0.70 ? 1 : clamp(1 - (progress - 0.70) / 0.30))
    : 0

  // Rubble animasyonu
  const rubbleOp = step === 0 ? 1 : step === 1 ? Math.max(0, 1 - progress * 1.6) : 0
  const rubbleY  = step === 1 ? -progress * 30 : 0
  const rubbleScale = step === 1 ? 1 - progress * 0.15 : 1

  return (
    <section
      ref={sectionRef}
      className="section-padding border-t border-white/[0.06] overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1510 50%, #0a0a0a 100%)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="mb-10 md:mb-14">
          <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
            {t.process_tag}
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            {t.process_title}
          </h2>
        </div>

        {/* Metin + Görsel */}
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-14 lg:gap-20">

          {/* Sol: Step metni */}
          <div className="flex-1 w-full" style={{ minHeight: 220, position: 'relative' }}>
            {steps.map((s, i) => (
              <div
                key={i}
                className="absolute inset-0"
                style={{
                  opacity: step === i ? 1 : 0,
                  transform: step === i ? 'translateY(0)' : 'translateY(12px)',
                  transition: 'opacity 600ms ease, transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                  pointerEvents: step === i ? 'auto' : 'none',
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

          {/* Sağ: Logo animasyonu + dots */}
          <div className="flex-shrink-0 flex flex-col items-center gap-6">
            <div
              style={{
                position: 'relative',
                width: 'min(288px, 72vw)',
                aspectRatio: '1 / 1',
              }}
            >
              {/* Ambient gold glow */}
              <div
                style={{
                  position: 'absolute', inset: '-15%',
                  background: `radial-gradient(circle at 50% 55%, rgba(179,147,69,${0.05 + (step >= 2 ? 0.10 : 0) + finalPulse * 0.18}) 0%, transparent 60%)`,
                  filter: 'blur(20px)', pointerEvents: 'none',
                  transition: 'all 600ms ease',
                }}
              />

              {/* Zemin gölgesi */}
              <div
                style={{
                  position: 'absolute', bottom: '6%', left: '15%', right: '15%', height: 14,
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
                  filter: 'blur(8px)',
                }}
              />

              {/* Yıkık taş yığını */}
              <div
                style={{
                  position: 'absolute', inset: 0,
                  opacity: rubbleOp,
                  transform: `translateY(${rubbleY}px) scale(${rubbleScale})`,
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Image src="/logo-rubble-v2.png" alt="Taş yığını" fill className="object-contain object-bottom" />
              </div>

              {/* Toz parçacıkları */}
              {step <= 1 && <RisingDust step={step} progress={progress} />}

              {/* Logo bölgeleri */}
              {REGIONS.map(r => (
                <LogoRegion
                  key={r.name}
                  name={r.name}
                  poly={r.poly}
                  step={r.step}
                  activeStep={step}
                  progress={progress}
                  finalPulse={finalPulse}
                />
              ))}

              {/* Shine sweep (sahne 3 başı) */}
              {step === 3 && progress > 0.05 && progress < 0.35 && (
                <ShineSweep progress={(progress - 0.05) / 0.30} />
              )}
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    width: i === step ? 32 : 6,
                    height: 6,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.12)',
                    transition: 'width 400ms cubic-bezier(0.22, 1, 0.36, 1)',
                    overflow: 'hidden',
                  }}
                >
                  {i === step && (
                    <div style={{ position: 'absolute', inset: 0, width: `${progress * 100}%`, background: '#b39345', opacity: 0.85 }} />
                  )}
                  {i !== step && i < step && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(179,147,69,0.4)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
