'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Calendar, User, ArrowRight, Loader2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface BlogItem {
  id: string
  slug: string
  title: string
  title_en?: string; title_es?: string; title_ar?: string; title_de?: string; title_fr?: string; title_ru?: string
  cover_image_url: string
  author_name: string
  meta_description: string
  meta_description_en?: string; meta_description_es?: string; meta_description_ar?: string; meta_description_de?: string; meta_description_fr?: string; meta_description_ru?: string
  published_at: string
  ai_generated: boolean
}

function getLocalized(blog: BlogItem, field: 'title' | 'meta_description', locale: string): string {
  if (locale === 'tr') return blog[field]
  const key = `${field}_${locale}` as keyof BlogItem
  return (blog[key] as string) || blog[field]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BlogPage() {
  const { locale } = useLanguage()
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [years, setYears] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBlogs(data)
          const uniqueYears = Array.from(new Set(
            data
              .filter((b: BlogItem) => b.published_at)
              .map((b: BlogItem) => new Date(b.published_at).getFullYear().toString())
          )).sort((a, b) => parseInt(b) - parseInt(a))
          setYears(uniqueYears)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredBlogs = selectedYear === 'all'
    ? blogs
    : blogs.filter(b => b.published_at && new Date(b.published_at).getFullYear().toString() === selectedYear)

  const featuredBlog = filteredBlogs[0]
  const restBlogs = filteredBlogs.slice(1)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a]">
        {/* Hero Section with Background Image */}
        <div className="relative min-h-[50vh] md:min-h-[55vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/blog-hero.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/50 to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/40 to-transparent" />

          {/* Content */}
          <div className="relative z-10 text-center px-6 md:px-12 pt-28 pb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-400/30 bg-gold-400/[0.08] backdrop-blur-sm mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-gold-400 text-[11px] font-mono tracking-wider uppercase">Blog</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-5">
              Doğal Taş Dünyasından
            </h1>
            <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto font-body leading-relaxed">
              Mimari trendler, uygulama rehberleri ve doğal taş sektöründen güncel içerikler
            </p>

            {/* Year Filter */}
            {years.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setSelectedYear('all')}
                  className={`px-5 py-2 rounded-full text-xs font-medium backdrop-blur-sm transition-all duration-300 ${
                    selectedYear === 'all'
                      ? 'bg-gold-400/20 text-gold-400 border border-gold-400/30'
                      : 'bg-white/[0.06] text-white/50 border border-white/[0.1] hover:text-white/70'
                  }`}
                >
                  Tümü
                </button>
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-5 py-2 rounded-full text-xs font-medium backdrop-blur-sm transition-all duration-300 ${
                      selectedYear === year
                        ? 'bg-gold-400/20 text-gold-400 border border-gold-400/30'
                        : 'bg-white/[0.06] text-white/50 border border-white/[0.1] hover:text-white/70'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-14">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 size={32} className="mx-auto text-gold-400 animate-spin" />
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 text-lg">Henüz blog yazısı yayınlanmamış</p>
            </div>
          ) : (
            <>
              {/* Featured Blog (first one - full width) */}
              {featuredBlog && (
                <Link href={`/blog/${featuredBlog.slug}`} className="group block mb-12">
                  <article className="relative rounded-3xl overflow-hidden border border-white/[0.06] hover:border-gold-400/30 transition-all duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      {/* Image */}
                      <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[400px] overflow-hidden">
                        {featuredBlog.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={featuredBlog.cover_image_url}
                            alt={getLocalized(featuredBlog, 'title', locale)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-white/[0.06] to-white/[0.02]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]/80 hidden lg:block" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent lg:hidden" />
                      </div>

                      {/* Content */}
                      <div className="relative p-6 md:p-8 lg:p-10 flex flex-col justify-center bg-white/[0.02]">
                        <div className="inline-flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 bg-gold-400/10 text-gold-400 text-[10px] font-mono rounded-full border border-gold-400/20">
                            Son Yazı
                          </span>
                        </div>

                        <h2 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4 group-hover:text-gold-400 transition-colors duration-300 leading-tight">
                          {getLocalized(featuredBlog, 'title', locale)}
                        </h2>

                        {featuredBlog.meta_description && (
                          <p className="text-white/40 text-sm font-body mb-6 leading-relaxed line-clamp-3">
                            {getLocalized(featuredBlog, 'meta_description', locale)}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex items-center gap-2 text-white/30 text-xs">
                            <User size={13} />
                            <span className="font-body">{featuredBlog.author_name}</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <div className="flex items-center gap-2 text-white/30 text-xs">
                            <Calendar size={13} />
                            <span className="font-body">{formatDate(featuredBlog.published_at)}</span>
                          </div>
                        </div>

                        <div>
                          <span className="inline-flex items-center gap-2 text-gold-400 text-sm font-medium group-hover:gap-3 transition-all duration-300">
                            Devamını Oku <ArrowRight size={16} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* Divider */}
              {restBlogs.length > 0 && (
                <div className="flex items-center gap-4 mb-10">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-white/20 text-[10px] font-mono tracking-widest uppercase">Tüm Yazılar</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
              )}

              {/* Rest of blogs - Grid */}
              {restBlogs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {restBlogs.map((blog) => (
                    <Link
                      key={blog.id}
                      href={`/blog/${blog.slug}`}
                      className="group"
                    >
                      <article className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-gold-400/30 hover:bg-white/[0.04] transition-all duration-500 flex flex-col">
                        {/* Cover Image */}
                        <div className="relative aspect-[16/9] overflow-hidden">
                          {blog.cover_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={blog.cover_image_url}
                              alt={getLocalized(blog, 'title', locale)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-white/[0.06] to-white/[0.02] flex items-center justify-center">
                              <span className="text-white/10 font-heading text-5xl">U</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="p-5 md:p-6 flex flex-col flex-1">
                          <h2 className="font-heading text-base md:text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-gold-400 transition-colors duration-300 leading-snug">
                            {getLocalized(blog, 'title', locale)}
                          </h2>

                          {blog.meta_description && (
                            <p className="text-white/35 text-xs font-body line-clamp-2 mb-4 leading-relaxed flex-1">
                              {getLocalized(blog, 'meta_description', locale)}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                            <div className="flex items-center gap-3">
                              <span className="text-white/25 text-[11px] font-body">{blog.author_name}</span>
                              <span className="text-white/15 text-[11px] font-body">{formatDate(blog.published_at)}</span>
                            </div>
                            <ArrowRight size={14} className="text-white/15 group-hover:text-gold-400 group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
