'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'

export default function ElfsightChat() {
  const { locale } = useLanguage()

  useEffect(() => {
    // Sadece Türkçe'de göster
    if (locale !== 'tr') {
      // Widget varsa kaldır
      const existing = document.querySelector('.elfsight-app-0848fb48-7f87-4355-9e7f-3fa06eb7571a')
      if (existing) existing.remove()
      return
    }

    // Script zaten yüklüyse tekrar ekleme
    if (document.querySelector('script[src*="elfsight"]')) {
      // Widget div'i yoksa ekle
      if (!document.querySelector('.elfsight-app-0848fb48-7f87-4355-9e7f-3fa06eb7571a')) {
        const div = document.createElement('div')
        div.className = 'elfsight-app-0848fb48-7f87-4355-9e7f-3fa06eb7571a'
        div.setAttribute('data-elfsight-app-lazy', '')
        document.body.appendChild(div)
      }
      return
    }

    // Elfsight script'ini yükle
    const script = document.createElement('script')
    script.src = 'https://static.elfsight.com/platform/platform.js'
    script.async = true
    document.head.appendChild(script)

    // Widget div'ini ekle
    const div = document.createElement('div')
    div.className = 'elfsight-app-0848fb48-7f87-4355-9e7f-3fa06eb7571a'
    div.setAttribute('data-elfsight-app-lazy', '')
    document.body.appendChild(div)

    return () => {
      const widget = document.querySelector('.elfsight-app-0848fb48-7f87-4355-9e7f-3fa06eb7571a')
      if (widget) widget.remove()
    }
  }, [locale])

  return null
}
