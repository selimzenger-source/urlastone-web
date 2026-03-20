'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) return

    // Daha once kapatildiysa gosterme (7 gun)
    const dismissed = localStorage.getItem('pwa-dismissed')
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    // Zaten PWA olarak aciksa gosterme
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // iOS kontrolu
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
    setIsIOS(isIOSDevice)

    // Android/Desktop: beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // 3 saniye sonra goster
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // iOS icin 3 saniye sonra goster
    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 3000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [isAdmin])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    } else if (isIOS) {
      setShowIOSGuide(true)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setShowIOSGuide(false)
    localStorage.setItem('pwa-dismissed', String(Date.now()))
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-slide-up md:left-auto md:right-6 md:max-w-sm">
      <div className="bg-[#1a1a1a] border border-white/[0.1] rounded-2xl p-4 shadow-2xl shadow-black/50">
        {showIOSGuide ? (
          // iOS rehberi
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium text-sm">Ana Ekrana Ekle</h4>
              <button onClick={handleDismiss} className="text-white/30 hover:text-white/60">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-white/60 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
                <p>Alttaki <strong className="text-white/80">paylas</strong> butonuna (kare + ok) dokunun</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
                <p>Asagi kayip <strong className="text-white/80">&quot;Ana Ekrana Ekle&quot;</strong> secin</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
                <p>Sag ustten <strong className="text-white/80">&quot;Ekle&quot;</strong> ye dokunun</p>
              </div>
            </div>
            <button onClick={handleDismiss}
              className="w-full mt-3 py-2 rounded-xl bg-white/[0.06] text-white/40 text-xs font-mono hover:bg-white/[0.1] transition-colors">
              Anladim
            </button>
          </div>
        ) : (
          // Normal prompt
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-400/15 flex items-center justify-center flex-shrink-0">
              <Smartphone size={20} className="text-gold-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm mb-0.5">URLASTONE</h4>
              <p className="text-white/40 text-xs mb-3">Uygulamayi ana ekranina ekle, hizli eris</p>
              <div className="flex gap-2">
                <button onClick={handleInstall}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-400/20 text-gold-400 text-xs font-medium hover:bg-gold-400/30 transition-colors">
                  <Download size={12} />
                  Yukle
                </button>
                <button onClick={handleDismiss}
                  className="px-3 py-2 rounded-xl text-white/30 text-xs hover:text-white/50 transition-colors">
                  Daha sonra
                </button>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-white/20 hover:text-white/40 flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
