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

function getDeviceInfo() {
  if (typeof window === 'undefined') return { device: 'desktop', os: 'unknown', browser: 'unknown' }

  const ua = navigator.userAgent

  // OS Detection
  let os = 'Diğer'
  if (/iPhone/.test(ua)) os = 'iOS'
  else if (/iPad/.test(ua)) os = 'iPadOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'
  else if (/CrOS/.test(ua)) os = 'ChromeOS'

  // Device type
  let device = 'desktop'
  if (/iPhone|Android.*Mobile/i.test(ua)) device = 'mobile'
  else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) device = 'tablet'

  // Browser Detection
  let browser = 'Diğer'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = 'Chrome'
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'

  return { device, os, browser }
}

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return

    const timer = setTimeout(() => {
      const { device, os, browser } = getDeviceInfo()

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pathname,
          referrer: document.referrer || null,
          session_id: getSessionId(),
          device,
          os,
          browser,
          language: (navigator.language || 'unknown').split('-')[0],
        }),
      }).catch(() => {})
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
