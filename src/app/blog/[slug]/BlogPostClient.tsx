'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowLeft, Calendar, User, Sparkles } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface Blog {
  id: string
  slug: string
  title: string
  title_en?: string; title_es?: string; title_ar?: string; title_de?: string; title_fr?: string; title_ru?: string
  content: string
  content_en?: string; content_es?: string; content_ar?: string; content_de?: string; content_fr?: string; content_ru?: string
  cover_image_url: string
  author_name: string
  meta_description: string
  is_published: boolean
  ai_generated: boolean
  published_at: string
}

function getLocalized(blog: Blog, field: 'title' | 'content', locale: string): string {
  if (locale === 'tr') return blog[field]
  const key = `${field}_${locale}` as keyof Blog
  return (blog[key] as string) || blog[field]
}

export default function BlogPostClient({ blog: initialBlog, slug }: { blog: Blog | null; slug: string }) {
  const { locale } = useLanguage()
  const [blog, setBlog] = useState<Blog | null>(initialBlog)
  const [loading, setLoading] = useState(!initialBlog)

  // Fallback client-side fetch if server-side didn't work
  useEffect(() => {
    if (!initialBlog) {
      fetch(`/api/blogs/by-slug/${slug}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => setBlog(data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [initialBlog, slug])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#0a0a0a] pt-28 pb-20">
          <div className="max-w-3xl mx-auto px-6 text-center py-20">
            <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#0a0a0a] pt-28 pb-20">
          <div className="max-w-3xl mx-auto px-6 text-center py-20">
            <h1 className="font-heading text-2xl text-white mb-4">Blog Yazısı Bulunamadı</h1>
            <Link href="/blog" className="text-gold-400 text-sm hover:underline">
              Blog&apos;a Dön
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a]">
        {/* Hero Cover */}
        {blog.cover_image_url && (
          <div className="relative w-full h-[40vh] md:h-[50vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          </div>
        )}

        {/* Article */}
        <div className={`max-w-3xl mx-auto px-6 md:px-8 ${blog.cover_image_url ? '-mt-24 relative z-10' : 'pt-28'}`}>
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-white/30 text-xs hover:text-white/60 transition-colors mb-6"
          >
            <ArrowLeft size={12} /> Blog
          </Link>

          {/* Title */}
          <h1 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {getLocalized(blog, 'title', locale)}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-10 pb-8 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <User size={14} />
              <span className="font-body">{blog.author_name}</span>
            </div>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Calendar size={14} />
              <span className="font-body">
                {new Date(blog.published_at).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Content */}
          <article
            className="prose-blog mb-16"
            dangerouslySetInnerHTML={{ __html: getLocalized(blog, 'content', locale) }}
          />

          {/* CTA */}
          <div className="rounded-2xl border border-gold-400/20 bg-gold-400/[0.03] p-6 md:p-8 mb-16">
            <h3 className="font-heading text-lg md:text-xl font-bold text-white mb-3">
              Doğal Taşı Cephenizde Deneyin
            </h3>
            <p className="text-white/40 text-sm font-body mb-5 leading-relaxed">
              AI Simülasyon aracımızla kendi binanızın fotoğrafını yükleyin, taşlarımızın cephenizde nasıl duracağını anında görün.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/simulasyon"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
              >
                <Sparkles size={16} /> AI Simülasyonu Dene
              </Link>
              <Link
                href="/urunlerimiz"
                className="inline-flex items-center gap-2 border border-white/[0.15] text-white/70 px-6 py-3 rounded-full text-sm font-medium hover:border-white/30 hover:text-white transition-colors"
              >
                Ürünleri Keşfet
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
