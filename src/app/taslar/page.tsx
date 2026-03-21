'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  ArrowRight,
  Layers,
  Shield,
  Ruler,
  Palette,
  ChevronRight,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

interface StoneType {
  id: string
  name: string
  code: string
  image_url?: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  thickness?: string
  slogan?: string
  feature1?: string
  feature2?: string
  feature3?: string
  image_url?: string | null
}

interface Product {
  id: string
  name: string
  code: string
  image_url: string | null
  description: string | null
  category: Category
  stone_type: StoneType
}

export default function TaslarPage() {
  const { t } = useLanguage()
  const [activeCategory, setActiveCategory] = useState('nature')
  const [activeStoneType, setActiveStoneType] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stoneTypes, setStoneTypes] = useState<StoneType[]>([])
  const [loading, setLoading] = useState(true)
  const [catalogUrl, setCatalogUrl] = useState<string | null>(null)

  // Fetch data on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/stone-types').then(r => r.json()),
      fetch('/api/katalog').then(r => r.json()).catch(() => ({ url: null })),
    ]).then(([prods, cats, types, katalog]) => {
      setProducts(prods)
      setCategories(cats)
      setStoneTypes(types)
      if (katalog?.url) setCatalogUrl(katalog.url)
      setLoading(false)
    })
  }, [])

  // Category descriptions: DB values override i18n fallbacks
  const i18nFallback: Record<string, { slogan: string; desc: string; features: string[]; thickness: string }> = {
    nature: { slogan: t.stones_nature_slogan, desc: t.stones_nature_desc, features: [t.stones_nature_f1, t.stones_nature_f2, t.stones_nature_f3], thickness: '1.5 – 3 cm' },
    mix: { slogan: t.stones_mix_slogan, desc: t.stones_mix_desc, features: [t.stones_mix_f1, t.stones_mix_f2, t.stones_mix_f3], thickness: '1.5 – 3 cm' },
    crazy: { slogan: t.stones_crazy_slogan, desc: t.stones_crazy_desc, features: [t.stones_crazy_f1, t.stones_crazy_f2, t.stones_crazy_f3], thickness: '1.5 – 2.5 cm' },
    line: { slogan: t.stones_line_slogan, desc: t.stones_line_desc, features: [t.stones_line_f1, t.stones_line_f2, t.stones_line_f3], thickness: '1 – 2 cm' },
  }

  // Build categoryInfo using DB fields when available, fallback to i18n
  const getCategoryInfo = (slug: string) => {
    const fb = i18nFallback[slug] || { slogan: '', desc: '', features: [], thickness: '' }
    const cat = categories.find(c => c.slug === slug)
    if (!cat) return fb
    return {
      slogan: cat.slogan || fb.slogan,
      desc: cat.description || fb.desc,
      features: [cat.feature1 || fb.features[0] || '', cat.feature2 || fb.features[1] || '', cat.feature3 || fb.features[2] || ''].filter(Boolean),
      thickness: cat.thickness || fb.thickness,
    }
  }

  const categoryInfo = Object.fromEntries(
    [...Object.keys(i18nFallback), ...categories.map(c => c.slug)]
      .filter((v, i, a) => a.indexOf(v) === i)
      .map(slug => [slug, getCategoryInfo(slug)])
  )

  // Stone type display info (fallback images if no DB image)
  const stoneTypeInfo: Record<string, { name: string; desc: string; foto: string }> = {
    TRV: { name: t.stones_traverten_name, desc: t.stones_traverten_desc, foto: '/featured-traverten.jpg' },
    MRMR: { name: t.stones_mermer_name, desc: t.stones_mermer_desc, foto: '/featured-mermer.jpg' },
    BZLT: { name: t.stones_bazalt_name, desc: t.stones_bazalt_desc, foto: '/featured-bazalt.jpg' },
    KLKR: { name: t.stones_kalker_name, desc: t.stones_kalker_desc, foto: '/featured-kalker.jpg' },
  }

  // Use DB image_url if available, fallback to hardcoded
  const getStoneTypeImage = (st: StoneType) => {
    if (st.image_url) return st.image_url
    return stoneTypeInfo[st.code]?.foto || '/featured-traverten.jpg'
  }

  const kullanimAlanlari = [
    { baslik: t.stones_usage1_name, icon: Layers },
    { baslik: t.stones_usage2_name, icon: Palette },
    { baslik: t.stones_usage3_name, icon: Ruler },
    { baslik: t.stones_usage4_name, icon: Shield },
  ]

  // Filter products by category
  const categoryProducts = products.filter(
    p => p.category?.slug === activeCategory
  )

  // Filter products by stone type
  const stoneTypeProducts = activeStoneType
    ? products.filter(p => p.stone_type?.code === activeStoneType)
    : []

  const aktifInfo = categoryInfo[activeCategory]

  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-400/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              {t.stones_tag}
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              {t.stones_title1}
              <span className="block hero-gold-text">{t.stones_title2}</span>
            </h1>
            <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              {t.stones_desc}
            </p>
          </div>
        </div>
      </section>

      {/* Rockshell Serisi - Kategoriler */}
      <section className="py-20 md:py-28 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              {t.stones_rockshell_tag}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              {t.stones_rockshell_title}
            </h2>
          </div>

          {/* Category Cards */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`group w-[130px] sm:w-[150px] rounded-2xl p-3 transition-all duration-300 text-center ${
                  activeCategory === cat.slug
                    ? 'bg-white/[0.06] border-2 border-gold-400 scale-[1.02]'
                    : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.05]'
                }`}
              >
                <div className="aspect-square rounded-xl bg-white/[0.04] mb-2.5 overflow-hidden flex items-center justify-center">
                  {cat.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`font-heading text-3xl font-bold ${
                      activeCategory === cat.slug ? 'text-gold-400/20' : 'text-white/10'
                    }`}>
                      {cat.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h4 className={`font-heading text-sm font-semibold transition-colors ${
                  activeCategory === cat.slug ? 'text-gold-400' : 'text-white'
                }`}>
                  {cat.name}
                </h4>
              </button>
            ))}
          </div>

          {/* Category Info + Products */}
          {aktifInfo && (
            <div className="mb-12">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <p className="text-gold-400 text-xs font-mono tracking-[0.2em] uppercase mb-2">Rockshell</p>
                <h3 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">
                  {categories.find(c => c.slug === activeCategory)?.name}
                </h3>
                <p className="text-white/60 text-lg mb-4">{aktifInfo.slogan}</p>
                <p className="text-white/40 text-sm leading-relaxed mb-6">{aktifInfo.desc}</p>

                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {aktifInfo.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                      <span className="text-white/50 text-sm">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="inline-flex gap-4">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-6 py-3">
                    <p className="text-white/30 text-[10px] font-mono uppercase">{t.stones_thickness}</p>
                    <p className="text-white font-medium text-sm mt-1">{aktifInfo.thickness}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-6 py-3">
                    <p className="text-white/30 text-[10px] font-mono uppercase">{t.stones_technology}</p>
                    <p className="text-white font-medium text-sm mt-1">Rockshell</p>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="text-center py-12 text-white/30 font-mono text-sm">Yükleniyor...</div>
              ) : categoryProducts.length === 0 ? (
                <div className="text-center py-12 text-white/30 font-mono text-sm">Bu kategoride ürün bulunamadı</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {categoryProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 hover:border-gold-400/30 transition-all duration-300 text-center"
                    >
                      <div className="aspect-square rounded-xl bg-white/[0.04] mb-3 overflow-hidden flex items-center justify-center">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="text-white/10 font-heading text-3xl font-bold">
                            {product.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h4 className="font-heading text-sm font-semibold text-white mb-1">
                        {product.name}
                      </h4>
                      <p className="text-white/30 text-[10px] font-mono">{product.code}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Taş Türleri - 4 Kart */}
      <section className="py-20 md:py-28 bg-white/[0.02] border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              {t.stones_collection_tag}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              {t.stones_collection_title}
            </h2>
            <p className="text-white/40 text-sm max-w-xl mx-auto">
              {t.stones_collection_desc}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stoneTypes.map((st) => {
              const info = stoneTypeInfo[st.code]
              if (!info) return null
              return (
                <button
                  key={st.id}
                  onClick={() => setActiveStoneType(activeStoneType === st.code ? null : st.code)}
                  className={`group relative aspect-[4/3] rounded-2xl overflow-hidden transition-all duration-500 ${
                    activeStoneType === st.code
                      ? 'ring-2 ring-gold-400 scale-[1.02]'
                      : 'hover:scale-[1.02]'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getStoneTypeImage(st)}
                    alt={info.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-6">
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
                      {info.name}
                    </h3>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={14} className="text-white -rotate-45" />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Stone Type Products (expandable) */}
          {activeStoneType && (
            <div className="mt-12 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-heading text-2xl font-bold text-white">
                  {stoneTypeInfo[activeStoneType]?.name} <span className="text-gold-400">Rockshell</span>
                </h3>
                <button
                  onClick={() => setActiveStoneType(null)}
                  className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
                >
                  <X size={16} className="text-white/60" />
                </button>
              </div>
              {loading ? (
                <div className="text-center py-12 text-white/30 font-mono text-sm">Yükleniyor...</div>
              ) : stoneTypeProducts.length === 0 ? (
                <div className="text-center py-12 text-white/30 font-mono text-sm">Bu türde ürün bulunamadı</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {stoneTypeProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 hover:border-gold-400/30 transition-all duration-300 text-center"
                    >
                      <div className="aspect-square rounded-xl bg-white/[0.04] mb-3 overflow-hidden flex items-center justify-center">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="text-white/10 font-heading text-3xl font-bold">
                            {product.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h4 className="font-heading text-sm font-semibold text-white mb-1">
                        {product.name}
                      </h4>
                      <p className="text-white/30 text-[10px] font-mono">{product.code}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Kullanım Alanları */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-gold-400 text-xs font-mono tracking-[0.3em] uppercase mb-4">
              {t.stones_tag}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              {t.stones_usage_title}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kullanimAlanlari.map((alan) => {
              const Icon = alan.icon
              return (
                <div
                  key={alan.baslik}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center hover:border-gold-400/20 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gold-400/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-400/20 transition-colors">
                    <Icon size={28} className="text-gold-400" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-white">
                    {alan.baslik}
                  </h3>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Katalog */}
      {catalogUrl && (
        <section className="py-16 md:py-20 border-t border-white/[0.06]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.08] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              {/* PDF Visual */}
              <div className="flex-shrink-0">
                <div className="w-24 h-32 md:w-28 md:h-36 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col items-center justify-center p-3">
                  <img src="/pdf-icon.png" alt="PDF" className="w-16 h-20 md:w-20 md:h-24 object-contain" />
                  <span className="text-white/30 text-[8px] font-mono mt-1">2025-2026</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-gold-400 text-xs font-mono tracking-[0.2em] uppercase mb-2">Rockshell</p>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
                  Katalogumuzu İnceleyin
                </h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  Tüm ürünlerimizi, teknik detayları ve uygulama örneklerini içeren katalogumuz
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <a
                    href={catalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Katalogu Gör
                  </a>
                  <a
                    href={catalogUrl}
                    download
                    className="inline-flex items-center justify-center gap-2 border border-white/[0.12] text-white/70 px-6 py-3 rounded-full text-sm hover:bg-white/[0.04] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    İndir (PDF)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 md:py-24 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.stones_cta_title}
          </h2>
          <p className="text-white/40 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            {t.stones_cta_desc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/teklif"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
            >
              {t.common_teklif_al} <ArrowRight size={16} />
            </Link>
            <a
              href="https://wa.me/905532322144"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/[0.12] text-white/70 px-8 py-3.5 rounded-full text-sm hover:bg-white/[0.04] transition-colors"
            >
              {t.common_whatsapp}
            </a>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-[#111] border border-white/[0.08] rounded-3xl max-w-lg w-full p-6 md:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
            >
              <X size={16} className="text-white/60" />
            </button>

            {/* Product Image */}
            <div className="aspect-square rounded-2xl bg-white/[0.04] mb-6 overflow-hidden flex items-center justify-center">
              {selectedProduct.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <p className="text-gold-400 font-heading text-6xl font-bold opacity-20">
                    {selectedProduct.name}
                  </p>
                  <p className="text-white/20 text-xs font-mono mt-2">
                    {t.stones_image_placeholder}
                  </p>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="text-center">
              <p className="text-gold-400 text-[10px] font-mono tracking-[0.2em] uppercase mb-1">
                Rockshell · {selectedProduct.category?.name}
              </p>
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-1">
                {selectedProduct.name}
              </h3>
              <p className="text-white/30 text-sm font-mono mb-4">{selectedProduct.code}</p>

              <div className="flex justify-center gap-3 mb-6">
                <span className="px-3 py-1.5 rounded-full bg-gold-400/10 text-gold-400 text-[10px] font-mono">
                  {selectedProduct.stone_type?.name}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/[0.06] text-white/50 text-[10px] font-mono">
                  {selectedProduct.category?.name}
                </span>
              </div>

              <Link
                href={`/teklif?product=${encodeURIComponent(selectedProduct.code)}`}
                onClick={() => setSelectedProduct(null)}
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
              >
                {t.common_teklif_al} <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
