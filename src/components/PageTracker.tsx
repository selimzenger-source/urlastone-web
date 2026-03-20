'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function getSessionId() {
  if (typeof window === 'undefined') return null
  let sid = sessionStorage.getItem('_sid')
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36)
    sessionStorage.setItem('_sid', sid)
  }
  return sid
}

function getDevice() {
  if (typeof window === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) return 'mobile'
  if (/Tablet|iPad/i.test(ua)) return 'tablet'
  return 'desktop'
}

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return

    const timer = setTimeout(() => {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pathname,
          referrer: document.referrer || null,
          session_id: getSessionId(),
          device: getDevice(),
        }),
      }).catch(() => {})
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
