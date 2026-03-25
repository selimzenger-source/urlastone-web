/**
 * Generate a URL-friendly slug from a project name.
 * Turkish characters are transliterated, special chars removed.
 *
 * Examples:
 *   "D HOUSES | ÇEŞME"        → "d-houses-cesme"
 *   "SAMADHI HOTEL | ALAÇATI"  → "samadhi-hotel-alacati"
 *   "VİLLA PROJESİ — URLA"    → "villa-projesi-urla"
 */
export function generateSlug(name: string): string {
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'c',
    'ş': 's', 'Ş': 's',
    'ğ': 'g', 'Ğ': 'g',
    'ü': 'u', 'Ü': 'u',
    'ö': 'o', 'Ö': 'o',
    'ı': 'i', 'İ': 'i',
    'â': 'a', 'Â': 'a',
    'î': 'i', 'Î': 'i',
    'û': 'u', 'Û': 'u',
  }

  return name
    .split('')
    .map((ch) => turkishMap[ch] || ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // replace non-alphanumeric with hyphens
    .replace(/-+/g, '-')           // collapse consecutive hyphens
    .replace(/^-|-$/g, '')         // trim hyphens from start/end
}
