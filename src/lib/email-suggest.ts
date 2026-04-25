// Yaygin email provider'lar — typo duzeltme onerisi icin
const COMMON_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'yahoo.com.tr',
  'hotmail.com',
  'hotmail.com.tr',
  'outlook.com',
  'outlook.com.tr',
  'icloud.com',
  'yandex.com',
  'yandex.com.tr',
  'yandex.ru',
  'mail.ru',
  'live.com',
  'msn.com',
  'me.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'gmx.com',
  'gmx.de',
  'web.de',
  't-online.de',
]

const COMMON_TLDS = ['com', 'com.tr', 'net', 'org', 'de', 'co.uk', 'fr', 'es', 'ru']

// Levenshtein distance — iki string arasi kac harf farki var
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[a.length][b.length]
}

/**
 * Email yazim hatasi varsa duzeltme onerisi dondurur.
 * gnail.com → gmail.com, yahooo.com → yahoo.com vb.
 * Hata yoksa veya domain zaten dogruysa null dondurur.
 */
export function suggestEmail(email: string): string | null {
  if (!email || !email.includes('@')) return null
  const [local, domain] = email.toLowerCase().trim().split('@')
  if (!local || !domain || !domain.includes('.')) return null

  // Domain zaten dogruysa oneri yok
  if (COMMON_DOMAINS.includes(domain)) return null

  // 1) Domain typo (gnail.com, gmial.com vs)
  let bestDomain: string | null = null
  let bestDistance = 3 // 2 harf farkina kadar kabul
  for (const candidate of COMMON_DOMAINS) {
    const d = levenshtein(domain, candidate)
    if (d > 0 && d < bestDistance) {
      bestDistance = d
      bestDomain = candidate
    }
  }
  if (bestDomain) return `${local}@${bestDomain}`

  // 2) TLD typo (.con, .cm, .vom)
  const lastDotIdx = domain.lastIndexOf('.')
  if (lastDotIdx > 0) {
    const tld = domain.slice(lastDotIdx + 1)
    const root = domain.slice(0, lastDotIdx)
    if (!COMMON_TLDS.includes(tld) && !COMMON_TLDS.some(t => t.endsWith(tld))) {
      let bestTld: string | null = null
      let bestTldDist = 2
      for (const t of COMMON_TLDS) {
        const d = levenshtein(tld, t)
        if (d > 0 && d < bestTldDist) {
          bestTldDist = d
          bestTld = t
        }
      }
      if (bestTld) {
        const fixed = `${root}.${bestTld}`
        // Eger duzeltilmis hali common domain'e denk geldiyse onu oner
        if (COMMON_DOMAINS.includes(fixed)) return `${local}@${fixed}`
        // Aksi halde sadece TLD onerisini ver
        return `${local}@${fixed}`
      }
    }
  }

  return null
}
