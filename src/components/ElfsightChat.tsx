'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'

const WIDGET_CLASS = 'elfsight-app-0848fb48-7f87-4355-9e7f-3fa06eb7571a'
const STORAGE_KEY = 'elfsight_spam_guard'

interface SpamData {
  msgTimestamps: number[]   // mesaj zamanları (dakika bazlı rate limit)
  formCount: number         // ard arda form gönderme sayısı
  sessionCount: number      // gün içi açıp-kapama sayısı
  lastSessionDate: string   // son oturum tarihi (gün bazlı reset)
  blocked: boolean          // engellenmiş mi
  blockedUntil: number      // engel bitiş zamanı (timestamp)
}

function getSpamData(): SpamData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as SpamData
      // Gün değiştiyse sıfırla
      const today = new Date().toDateString()
      if (data.lastSessionDate !== today) {
        return { msgTimestamps: [], formCount: 0, sessionCount: 0, lastSessionDate: today, blocked: false, blockedUntil: 0 }
      }
      // Engel süresi dolduysa aç
      if (data.blocked && data.blockedUntil && Date.now() > data.blockedUntil) {
        return { ...data, blocked: false, blockedUntil: 0 }
      }
      return data
    }
  } catch {}
  return { msgTimestamps: [], formCount: 0, sessionCount: 0, lastSessionDate: new Date().toDateString(), blocked: false, blockedUntil: 0 }
}

function saveSpamData(data: SpamData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

function blockUser(data: SpamData, hours = 24): SpamData {
  return { ...data, blocked: true, blockedUntil: Date.now() + hours * 60 * 60 * 1000 }
}

function hideWidget() {
  // Widget'ı ve Elfsight iframe/container'ını gizle
  document.querySelectorAll(`[class*="elfsight"], .${WIDGET_CLASS}`).forEach(el => {
    (el as HTMLElement).style.display = 'none'
  })
}

export default function ElfsightChat() {
  const { locale } = useLanguage()

  useEffect(() => {
    // Sadece Türkçe'de göster
    if (locale !== 'tr') {
      const existing = document.querySelector(`.${WIDGET_CLASS}`)
      if (existing) existing.remove()
      return
    }

    // Spam kontrolü
    const spamData = getSpamData()
    if (spamData.blocked) {
      hideWidget()
      return
    }

    // Oturum sayacı: sayfa açıldığında +1
    spamData.sessionCount += 1
    if (spamData.sessionCount > 5) {
      // Gün içinde 5+ kez gir-çık yapıyorsa engelle
      const blocked = blockUser(spamData)
      saveSpamData(blocked)
      hideWidget()
      return
    }
    saveSpamData(spamData)

    // Script yükleme
    if (!document.querySelector('script[src*="elfsight"]')) {
      const script = document.createElement('script')
      script.src = 'https://static.elfsight.com/platform/platform.js'
      script.async = true
      document.head.appendChild(script)
    }

    // Widget div
    if (!document.querySelector(`.${WIDGET_CLASS}`)) {
      const div = document.createElement('div')
      div.className = WIDGET_CLASS
      div.setAttribute('data-elfsight-app-lazy', '')
      document.body.appendChild(div)
    }

    // MutationObserver: widget içi etkileşimleri izle
    const observer = new MutationObserver(() => {
      const data = getSpamData()
      if (data.blocked) { hideWidget(); return }

      // Mesaj inputu veya gönderim tespiti
      const chatMessages = document.querySelectorAll('[class*="elfsight"] [class*="message"]')
      const now = Date.now()
      const oneMinuteAgo = now - 60000

      // Her yeni mesaj DOM'a eklendiğinde timestamp kaydet
      if (chatMessages.length > (data.msgTimestamps.length || 0)) {
        data.msgTimestamps.push(now)
        // Son 1 dakikadaki mesajları filtrele
        data.msgTimestamps = data.msgTimestamps.filter(t => t > oneMinuteAgo)

        // Dakikada 3+ mesaj → engelle
        if (data.msgTimestamps.length > 3) {
          const blocked = blockUser(data)
          saveSpamData(blocked)
          hideWidget()
          return
        }
        saveSpamData(data)
      }

      // Form gönderim tespiti (Collect Contacts)
      const successMessages = document.querySelectorAll('[class*="elfsight"] [class*="success"]')
      if (successMessages.length > 0) {
        data.formCount = (data.formCount || 0) + 1
        if (data.formCount >= 2) {
          // 2+ kez form gönderdiyse engelle
          const blocked = blockUser(data)
          saveSpamData(blocked)
          hideWidget()
          return
        }
        saveSpamData(data)
      }
    })

    // Body'yi izle — Elfsight widget'ı dinamik yükleniyor
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      const widget = document.querySelector(`.${WIDGET_CLASS}`)
      if (widget) widget.remove()
    }
  }, [locale])

  return null
}
