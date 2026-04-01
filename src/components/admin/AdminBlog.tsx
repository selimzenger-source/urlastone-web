'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Edit3, Eye, EyeOff, Sparkles, RefreshCw, Save, X, Upload, AlertCircle, CheckCircle, Languages, FileText, Image } from 'lucide-react'

interface Blog {
  id: string
  slug: string
  title: string
  content: string
  cover_image_url: string
  author_name: string
  meta_description: string
  is_published: boolean
  ai_generated: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

const AUTHORS = ['Cihan Zenger', 'Fatih At', 'Özer Demirkıran']

export default function AdminBlog() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formAuthor, setFormAuthor] = useState(AUTHORS[0])
  const [formMeta, setFormMeta] = useState('')
  const [formCover, setFormCover] = useState('')
  const [formPublished, setFormPublished] = useState(false)
  const [formAiGenerated, setFormAiGenerated] = useState(false)

  // AI preview state
  const [showAiPreview, setShowAiPreview] = useState(false)
  const [translating, setTranslating] = useState<string | null>(null)
  const [showTopicInput, setShowTopicInput] = useState(false)
  const [topicInput, setTopicInput] = useState('')
  const [topicDesc, setTopicDesc] = useState('')

  // Monthly limit state
  const [monthlyLimitReached, setMonthlyLimitReached] = useState(false)
  const [limitMessage, setLimitMessage] = useState('')
  const [generateAttempts, setGenerateAttempts] = useState(0)
  const MAX_GENERATE_ATTEMPTS = 3

  // Source-based generation state
  const [showSourceInput, setShowSourceInput] = useState(false)
  const [sourceText, setSourceText] = useState('')
  const [sourceImages, setSourceImages] = useState<{ base64: string; type: string }[]>([])
  const [generatingFromSource, setGeneratingFromSource] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const sourceImageInputRef = useRef<HTMLInputElement>(null)
  const password = typeof window !== 'undefined' ? localStorage.getItem('admin_pw') || '' : ''

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs?all=true', {
        headers: { 'x-admin-password': password },
      })
      if (!res.ok) {
        if (res.status === 500 || res.status === 404) {
          setNeedsSetup(true)
        }
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        setBlogs(data)
        setNeedsSetup(false)
      } else {
        setNeedsSetup(true)
      }
    } catch {
      setNeedsSetup(true)
    } finally {
      setLoading(false)
    }
  }

  const checkMonthlyLimit = async () => {
    try {
      const res = await fetch('/api/blogs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ checkLimit: true }),
      })
      const data = await res.json()
      setMonthlyLimitReached(!data.allowed)
      setLimitMessage(data.message || '')
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchBlogs(); checkMonthlyLimit() }, [])

  const handleSetup = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/blogs/setup', {
        method: 'POST',
        headers: { 'x-admin-password': password },
      })
      const data = await res.json()
      if (res.ok) {
        showMsg('success', data.message || 'Tablo oluşturuldu')
        setNeedsSetup(false)
        fetchBlogs()
      } else {
        showMsg('error', data.manual_sql
          ? 'Tablo oluşturulamadı. SQL\'i Supabase dashboard\'da çalıştırın.'
          : data.error)
      }
    } catch {
      showMsg('error', 'Bağlantı hatası')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setEditId(null)
    setFormTitle('')
    setFormContent('')
    setFormAuthor(AUTHORS[0])
    setFormMeta('')
    setFormCover('')
    setFormPublished(false)
    setFormAiGenerated(false)
    setShowForm(false)
    setShowAiPreview(false)
  }

  const handleEdit = (blog: Blog) => {
    setEditId(blog.id)
    setFormTitle(blog.title)
    setFormContent(blog.content)
    setFormAuthor(blog.author_name)
    setFormMeta(blog.meta_description)
    setFormCover(blog.cover_image_url)
    setFormPublished(blog.is_published)
    setFormAiGenerated(blog.ai_generated)
    setShowForm(true)
    setShowAiPreview(false)
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/blogs/upload', {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setFormCover(data.url)
        showMsg('success', 'Kapak resmi yüklendi')
      } else {
        showMsg('error', data.error || 'Yükleme hatası')
      }
    } catch {
      showMsg('error', 'Yükleme başarısız')
    }
  }

  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      showMsg('error', 'Başlık ve içerik zorunlu')
      return
    }

    setSaving(true)
    try {
      const body = {
        title: formTitle,
        content: formContent,
        cover_image_url: formCover,
        author_name: formAuthor,
        meta_description: formMeta,
        is_published: formPublished,
        ai_generated: formAiGenerated,
      }

      const url = editId ? `/api/blogs/${editId}` : '/api/blogs'
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        showMsg('success', editId ? 'Blog güncellendi' : 'Blog oluşturuldu')
        resetForm()
        fetchBlogs()
      } else {
        const data = await res.json()
        showMsg('error', data.error || 'Kaydetme hatası')
      }
    } catch {
      showMsg('error', 'Kaydetme başarısız')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu blogu silmek istediğinize emin misiniz?')) return

    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password },
      })
      if (res.ok) {
        showMsg('success', 'Blog silindi')
        fetchBlogs()
      } else {
        showMsg('error', 'Silme hatası')
      }
    } catch {
      showMsg('error', 'Silme başarısız')
    }
  }

  const handleTogglePublish = async (blog: Blog) => {
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ is_published: !blog.is_published }),
      })
      if (res.ok) {
        showMsg('success', blog.is_published ? 'Taslağa alındı' : 'Yayınlandı')
        fetchBlogs()
      }
    } catch {
      showMsg('error', 'Güncelleme hatası')
    }
  }

  const handleTranslate = async (blogId: string) => {
    setTranslating(blogId)
    try {
      const res = await fetch('/api/blogs/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ blogId }),
      })
      const data = await res.json()
      if (res.ok) {
        showMsg('success', '6 dile çevrildi')
        fetchBlogs()
      } else if (res.status === 207) {
        // Partial success
        showMsg('error', data.error || 'Bazı diller çevrilemedi')
        fetchBlogs()
      } else {
        showMsg('error', data.error || 'Çeviri hatası')
      }
    } catch {
      showMsg('error', 'Çeviri başarısız')
    } finally {
      setTranslating(null)
    }
  }

  const handleGenerate = async () => {
    if (generateAttempts >= MAX_GENERATE_ATTEMPTS) {
      showMsg('error', `Bu ay için maksimum ${MAX_GENERATE_ATTEMPTS} deneme hakkınız doldu. Mevcut önizlemeyi düzenleyip yayınlayabilirsiniz.`)
      return
    }
    setGenerating(true)
    setShowTopicInput(false)
    try {
      const body: Record<string, string> = {}
      if (topicInput.trim()) body.topic = topicInput.trim()
      if (topicDesc.trim()) body.description = topicDesc.trim()

      const res = await fetch('/api/blogs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (res.ok) {
        setFormTitle(data.title || '')
        setFormContent(data.content || '')
        setFormMeta(data.meta_description || '')
        setFormCover(data.cover_image_url || '')
        setFormAuthor(AUTHORS[0])
        setFormPublished(false)
        setFormAiGenerated(true)
        setEditId(null)
        setShowForm(true)
        setShowAiPreview(true)
        setGenerateAttempts(prev => prev + 1)
        showMsg('success', `AI blog üretildi! (${generateAttempts + 1}/${MAX_GENERATE_ATTEMPTS} deneme) Önizleme yapın ve yayınlayın.`)
        checkMonthlyLimit() // Refresh limit status
      } else {
        if (res.status === 429) {
          setMonthlyLimitReached(true)
          setLimitMessage(data.error || 'Aylık limit doldu')
        }
        showMsg('error', data.error || 'AI üretim hatası')
      }
    } catch {
      showMsg('error', 'AI üretim başarısız')
    } finally {
      setGenerating(false)
    }
  }

  const handleSourceImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        setSourceImages(prev => [...prev, { base64, type: file.type }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleGenerateFromSource = async () => {
    if (!sourceText.trim() && sourceImages.length === 0) {
      showMsg('error', 'Metin yapıştırın veya screenshot yükleyin')
      return
    }
    setGeneratingFromSource(true)
    setShowSourceInput(false)
    try {
      // If multiple images, send them one by one and combine text
      let combinedSourceText = sourceText.trim()

      // If images exist, first extract text from all images
      if (sourceImages.length > 0) {
        // Send first image + any text
        const res = await fetch('/api/blogs/generate-from-source', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': password,
          },
          body: JSON.stringify({
            sourceText: combinedSourceText || undefined,
            sourceImage: sourceImages[0].base64,
            sourceImageType: sourceImages[0].type,
          }),
        })

        const data = await res.json()
        if (res.ok) {
          setFormTitle(data.title || '')
          setFormContent(data.content || '')
          setFormMeta(data.meta_description || '')
          setFormCover(data.cover_image_url || '')
          setFormAuthor(AUTHORS[0])
          setFormPublished(false)
          setFormAiGenerated(true)
          setEditId(null)
          setShowForm(true)
          setShowAiPreview(true)
          showMsg('success', 'Kaynaktan blog üretildi! Önizleme yapın ve yayınlayın.')
        } else {
          showMsg('error', data.error || 'Blog üretim hatası')
        }
      } else {
        // Only text, no images
        const res = await fetch('/api/blogs/generate-from-source', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': password,
          },
          body: JSON.stringify({ sourceText: combinedSourceText }),
        })

        const data = await res.json()
        if (res.ok) {
          setFormTitle(data.title || '')
          setFormContent(data.content || '')
          setFormMeta(data.meta_description || '')
          setFormCover(data.cover_image_url || '')
          setFormAuthor(AUTHORS[0])
          setFormPublished(false)
          setFormAiGenerated(true)
          setEditId(null)
          setShowForm(true)
          setShowAiPreview(true)
          showMsg('success', 'Kaynaktan blog üretildi! Önizleme yapın ve yayınlayın.')
        } else {
          showMsg('error', data.error || 'Blog üretim hatası')
        }
      }
    } catch {
      showMsg('error', 'Blog üretim başarısız')
    } finally {
      setGeneratingFromSource(false)
      setSourceText('')
      setSourceImages([])
    }
  }

  // Setup screen
  if (needsSetup) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-gold-400 mb-4" />
        <h3 className="font-heading text-xl text-white mb-2">Blog Tablosu Bulunamadı</h3>
        <p className="text-white/40 text-sm mb-6">Blog sistemi için veritabanı tablosu oluşturulmalı.</p>
        <button
          onClick={handleSetup}
          disabled={saving}
          className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-stone-200 transition-colors disabled:opacity-50"
        >
          {saving ? 'Oluşturuluyor...' : 'Tabloyu Oluştur'}
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/40 text-sm mt-4">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-xl text-sm ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Header */}
      {!showForm && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Blog Yazıları</h3>
            <p className="text-white/40 text-sm">{blogs.length} blog yazısı</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] border border-white/[0.1] text-white rounded-xl text-sm hover:bg-white/[0.1] transition-colors"
            >
              <Plus size={16} /> Manuel Ekle
            </button>
            <button
              onClick={() => { setShowSourceInput(!showSourceInput); setShowTopicInput(false) }}
              disabled={generatingFromSource}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
            >
              {generatingFromSource ? (
                <><RefreshCw size={16} className="animate-spin" /> Üretiliyor...</>
              ) : (
                <><FileText size={16} /> Kaynaktan Üret</>
              )}
            </button>
            <button
              onClick={() => { !monthlyLimitReached && setShowTopicInput(!showTopicInput); setShowSourceInput(false) }}
              disabled={generating || monthlyLimitReached}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 ${
                monthlyLimitReached
                  ? 'bg-white/[0.04] border border-white/[0.08] text-white/30 cursor-not-allowed'
                  : 'bg-gold-400/10 border border-gold-400/30 text-gold-400 hover:bg-gold-400/20'
              }`}
              title={monthlyLimitReached ? limitMessage : ''}
            >
              {generating ? (
                <><RefreshCw size={16} className="animate-spin" /> Üretiliyor...</>
              ) : monthlyLimitReached ? (
                <><AlertCircle size={16} /> Bu Ay Kullanıldı</>
              ) : (
                <><Sparkles size={16} /> Bu Ayın Blogunu Üret</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Monthly Limit Info */}
      {!showForm && monthlyLimitReached && (
        <div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
          <AlertCircle size={18} className="text-white/30 flex-shrink-0" />
          <p className="text-white/40 text-sm">{limitMessage}</p>
        </div>
      )}

      {/* Topic Input for AI Generation */}
      {showTopicInput && !showForm && !monthlyLimitReached && (
        <div className="bg-gold-400/[0.03] border border-gold-400/20 rounded-2xl p-5 space-y-4">
          <h4 className="font-heading text-sm font-bold text-gold-400">AI Blog Üretimi</h4>
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Konu Başlığı <span className="text-white/20">(opsiyonel - boş bırakırsan AI kendi seçer)</span></label>
            <input
              value={topicInput}
              onChange={(e) => { setTopicInput(e.target.value); if (!e.target.value.trim()) setTopicDesc('') }}
              placeholder="örn: Şömine taş kaplama trendleri"
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400/50"
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Kısa Açıklama <span className="text-white/20">(opsiyonel)</span></label>
            <textarea
              value={topicDesc}
              onChange={(e) => setTopicDesc(e.target.value)}
              disabled={!topicInput.trim()}
              rows={2}
              placeholder={topicInput.trim() ? "örn: 2026 yılında iç mekan şömine tasarımlarında doğal taş kullanımı, modern ve rustik tarzlar" : "Önce konu başlığı girin"}
              className={`w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400/50 resize-none ${!topicInput.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 bg-gold-400/20 text-gold-400 border border-gold-400/30 rounded-xl text-sm font-medium hover:bg-gold-400/30 transition-colors disabled:opacity-50"
            >
              {generating ? <><RefreshCw size={14} className="animate-spin" /> Üretiliyor...</> : <><Sparkles size={14} /> Üret</>}
            </button>
            <button
              onClick={() => { setShowTopicInput(false); setTopicInput(''); setTopicDesc('') }}
              className="px-4 py-2.5 text-white/30 text-sm hover:text-white/60 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Source-based Generation Input */}
      {showSourceInput && !showForm && (
        <div className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-2xl p-5 space-y-4">
          <h4 className="font-heading text-sm font-bold text-emerald-400">Kaynaktan Blog Üret</h4>
          <p className="text-white/40 text-xs">Screenshot yükle veya kaynak metni yapıştır. AI içeriği Urlastone&apos;a uyarlayarak orijinal bir blog üretecek.</p>

          {/* Screenshot upload */}
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Screenshot Yükle <span className="text-white/20">(birden fazla olabilir)</span></label>
            <input
              ref={sourceImageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleSourceImageAdd}
              className="hidden"
            />
            <button
              onClick={() => sourceImageInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] border-dashed text-white/40 rounded-xl text-sm hover:bg-white/[0.08] hover:text-white/60 transition-colors"
            >
              <Image size={16} /> Görsel Seç
            </button>
            {sourceImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {sourceImages.map((img, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:${img.type};base64,${img.base64}`}
                      alt={`Kaynak ${i + 1}`}
                      className="h-20 rounded-lg border border-white/10 object-cover"
                    />
                    <button
                      onClick={() => setSourceImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Text input */}
          <div>
            <label className="block text-white/50 text-xs mb-1.5">Kaynak Metin <span className="text-white/20">(opsiyonel — screenshot varsa boş bırakabilirsiniz)</span></label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={6}
              placeholder="Kaynak makale/blog metnini buraya yapıştırın..."
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateFromSource}
              disabled={generatingFromSource || (!sourceText.trim() && sourceImages.length === 0)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
            >
              {generatingFromSource ? <><RefreshCw size={14} className="animate-spin" /> Üretiliyor...</> : <><Sparkles size={14} /> Blog Üret</>}
            </button>
            <button
              onClick={() => { setShowSourceInput(false); setSourceText(''); setSourceImages([]) }}
              className="px-4 py-2.5 text-white/30 text-sm hover:text-white/60 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-white">
              {showAiPreview ? 'AI Blog Önizlemesi' : editId ? 'Blog Düzenle' : 'Yeni Blog'}
            </h3>
            <div className="flex items-center gap-2">
              {showAiPreview && (
                <button
                  onClick={handleGenerate}
                  disabled={generating || generateAttempts >= MAX_GENERATE_ATTEMPTS}
                  className="flex items-center gap-1.5 px-3 py-2 text-gold-400 text-xs border border-gold-400/30 rounded-lg hover:bg-gold-400/10 transition-colors disabled:opacity-50"
                  title={generateAttempts >= MAX_GENERATE_ATTEMPTS ? 'Deneme hakkı doldu' : ''}
                >
                  {generating ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Başka Konu Dene ({MAX_GENERATE_ATTEMPTS - generateAttempts} hak)
                </button>
              )}
              <button onClick={resetForm} className="text-white/30 hover:text-white/60 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-white/50 text-xs mb-2">Kapak Resmi</label>
            {formCover && (
              <div className="relative mb-3 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: 240 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formCover} alt="Cover" className="w-full h-full object-cover" />
                <button
                  onClick={() => setFormCover('')}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-lg hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.1] text-white/60 rounded-lg text-sm hover:bg-white/[0.08] transition-colors"
            >
              <Upload size={14} /> {formCover ? 'Değiştir' : 'Yükle'}
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-white/50 text-xs mb-2">Başlık</label>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Blog başlığı (6-7 kelime)"
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-400/50"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-white/50 text-xs mb-2">Yazar</label>
            <select
              value={formAuthor}
              onChange={(e) => setFormAuthor(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-400/50"
            >
              {AUTHORS.map(a => (
                <option key={a} value={a} className="bg-[#111]">{a}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-white/50 text-xs mb-2">İçerik (HTML)</label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={12}
              placeholder="<h2>Alt Başlık</h2><p>Paragraf...</p>"
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-gold-400/50 resize-y"
            />
          </div>

          {/* Content Preview */}
          {formContent && (
            <div>
              <label className="block text-white/50 text-xs mb-2">Önizleme</label>
              <div
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 prose-blog"
                dangerouslySetInnerHTML={{ __html: formContent }}
              />
            </div>
          )}

          {/* Meta Description */}
          <div>
            <label className="block text-white/50 text-xs mb-2">Meta Description (SEO)</label>
            <textarea
              value={formMeta}
              onChange={(e) => setFormMeta(e.target.value)}
              rows={2}
              placeholder="150-160 karakter SEO açıklaması"
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-400/50 resize-none"
            />
            <p className="text-white/20 text-[10px] mt-1">{formMeta.length}/160 karakter</p>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFormPublished(!formPublished)}
              className={`relative w-11 h-6 rounded-full transition-colors ${formPublished ? 'bg-green-500' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${formPublished ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-white/60 text-sm">{formPublished ? 'Yayında' : 'Taslak'}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Kaydediliyor...' : editId ? 'Güncelle' : 'Kaydet'}
            </button>
            {showAiPreview && (
              <button
                onClick={() => { setFormPublished(true); handleSave() }}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gold-400/20 text-gold-400 border border-gold-400/30 rounded-xl text-sm font-medium hover:bg-gold-400/30 transition-colors disabled:opacity-50"
              >
                <Eye size={16} /> Yayınla
              </button>
            )}
            <button
              onClick={resetForm}
              className="px-4 py-3 text-white/40 text-sm hover:text-white/60 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Blog List */}
      {!showForm && (
        <div className="space-y-3">
          {blogs.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <p className="text-lg mb-2">Henüz blog yazısı yok</p>
              <p className="text-sm">Manuel ekleyebilir veya AI ile üretebilirsiniz</p>
            </div>
          ) : (
            blogs.map((blog) => (
              <div
                key={blog.id}
                className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.1] transition-colors"
              >
                {/* Cover Thumbnail */}
                {blog.cover_image_url && (
                  <div className="w-full sm:w-24 h-32 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={blog.cover_image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <h4 className="font-heading text-sm font-bold text-white truncate">{blog.title}</h4>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {blog.is_published ? (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[9px] rounded-full border border-green-500/20">Yayında</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-white/[0.06] text-white/40 text-[9px] rounded-full border border-white/[0.08]">Taslak</span>
                      )}
                      {blog.ai_generated && (
                        <span className="px-2 py-0.5 bg-gold-400/10 text-gold-400 text-[9px] rounded-full border border-gold-400/20">AI</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-white/30 text-[11px]">{blog.author_name}</span>
                    <span className="text-white/20 text-[11px]">
                      {blog.published_at
                        ? new Date(blog.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                        : new Date(blog.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                      }
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleTranslate(blog.id)}
                    disabled={translating === blog.id}
                    className="p-2 text-white/30 hover:text-blue-400 transition-colors disabled:opacity-50"
                    title="7 Dile Çevir"
                  >
                    {translating === blog.id ? <RefreshCw size={14} className="animate-spin" /> : <Languages size={14} />}
                  </button>
                  <button
                    onClick={() => handleTogglePublish(blog)}
                    className="p-2 text-white/30 hover:text-white/60 transition-colors"
                    title={blog.is_published ? 'Taslağa al' : 'Yayınla'}
                  >
                    {blog.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => handleEdit(blog)}
                    className="p-2 text-white/30 hover:text-gold-400 transition-colors"
                    title="Düzenle"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
