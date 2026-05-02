'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Trash2,
  X,
  Image as ImageIcon,
  Upload,
  Save,
  Edit3,
  Camera,
  Layers,
  Grid3X3,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react'

interface StoneType {
  id: string
  name: string
  code: string
  sort_order: number
  image_url?: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  thickness?: string
  description?: string
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
  is_active: boolean
  sort_order: number
  category_id: string
  stone_type_id: string
  category: Category
  stone_type: StoneType
}

export default function AdminTaslar() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stoneTypes, setStoneTypes] = useState<StoneType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterType, setFilterType] = useState('')
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // New product form
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', code: '', category_id: '', stone_type_id: '' })

  // New stone type form
  const [showNewStoneType, setShowNewStoneType] = useState(false)
  const [newStoneType, setNewStoneType] = useState({ name: '', code: '' })

  // New category form
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', thickness: '', slogan: '', description: '', feature1: '', feature2: '', feature3: '' })

  // Edit modals
  const [editStoneType, setEditStoneType] = useState<StoneType | null>(null)
  const [editCategory, setEditCategory] = useState<Category | null>(null)

  // Image upload
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [uploadTarget, setUploadTarget] = useState<'product' | 'stone_type' | 'category'>('product')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'product' | 'stone_type' | 'category'; name: string } | null>(null)

  // Fallback images for stone types
  const stoneTypeFallback: Record<string, string> = {
    TRV: '/featured-traverten.jpg',
    MRMR: '/featured-mermer.jpg',
    BZLT: '/featured-bazalt.jpg',
    KLKR: '/featured-kalker.jpg',
  }
  const getStoneTypeImage = (st: StoneType) => st.image_url || stoneTypeFallback[st.code] || null

  const password = typeof window !== 'undefined' ? localStorage.getItem('admin_pw') || '' : ''

  const fetchData = async () => {
    setLoading(true)
    // Cache-bust: admin paneli her zaman taze veri çeksin (Vercel CDN s-maxage'i bypass et)
    const t = Date.now()
    const [prods, cats, types] = await Promise.all([
      fetch(`/api/products?include_hidden=true&_t=${t}`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`/api/categories?_t=${t}`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`/api/stone-types?_t=${t}`, { cache: 'no-store' }).then(r => r.json()),
    ])
    setProducts(prods)
    setCategories(cats)
    setStoneTypes(types)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !filterCategory || p.category?.slug === filterCategory
    const matchType = !filterType || p.stone_type?.code === filterType
    return matchSearch && matchCategory && matchType
  })

  // ─── PRODUCT ACTIONS ───
  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.code || !newProduct.category_id || !newProduct.stone_type_id) {
      setFormError('Tüm alanları doldurun'); return
    }
    if (products.find(p => p.code.toLowerCase() === newProduct.code.toLowerCase())) {
      setFormError(`"${newProduct.code}" kodu zaten kullanılıyor`); return
    }
    setFormError('')
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(newProduct),
    })
    if (!res.ok) { setFormError('Ürün eklenirken hata oluştu'); return }
    setNewProduct({ name: '', code: '', category_id: '', stone_type_id: '' })
    setShowNewProduct(false)
    showSuccess('Ürün eklendi')
    fetchData()
  }

  const handleToggleProduct = async (id: string, currentActive: boolean) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ is_active: !currentActive }),
    })
    showSuccess(currentActive ? 'Ürün pasife alındı' : 'Ürün aktif edildi')
    fetchData()
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const { id, type } = deleteConfirm
    if (type === 'product') {
      await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password } })
    } else if (type === 'stone_type') {
      await fetch('/api/stone-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ id, _delete: true }),
      })
    } else if (type === 'category') {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ id, _delete: true }),
      })
    }
    setDeleteConfirm(null)
    showSuccess('Silindi')
    fetchData()
  }

  // ─── IMAGE UPLOAD ───
  const handleImageUpload = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) { alert('Sadece JPG, PNG veya WebP formatı'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return }
    if (!uploadingId) return
    const formData = new FormData()
    formData.append('file', file)
    let endpoint = ''
    if (uploadTarget === 'product') { formData.append('product_id', uploadingId); endpoint = '/api/products/upload' }
    else if (uploadTarget === 'stone_type') { formData.append('stone_type_id', uploadingId); endpoint = '/api/stone-types/upload' }
    else { formData.append('category_id', uploadingId); endpoint = '/api/categories/upload' }
    await fetch(endpoint, { method: 'POST', headers: { 'x-admin-password': password }, body: formData })
    setUploadingId(null)
    showSuccess('Resim yüklendi')
    fetchData()
  }

  const triggerUpload = (id: string, target: 'product' | 'stone_type' | 'category') => {
    setUploadingId(id)
    setUploadTarget(target)
    fileInputRef.current?.click()
  }

  // ─── STONE TYPE ACTIONS ───
  const handleCreateStoneType = async () => {
    if (!newStoneType.name || !newStoneType.code) { setFormError('Tür adı ve kodu zorunludur'); return }
    if (stoneTypes.find(st => st.code.toLowerCase() === newStoneType.code.toLowerCase())) {
      setFormError(`"${newStoneType.code}" kodu zaten var`); return
    }
    setFormError('')
    await fetch('/api/stone-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ ...newStoneType, sort_order: stoneTypes.length + 1 }),
    })
    setNewStoneType({ name: '', code: '' })
    setShowNewStoneType(false)
    showSuccess('Taş türü eklendi')
    fetchData()
  }

  const handleUpdateStoneType = async () => {
    if (!editStoneType) return
    await fetch('/api/stone-types', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: editStoneType.id, name: editStoneType.name, code: editStoneType.code }),
    })
    setEditStoneType(null)
    showSuccess('Taş türü güncellendi')
    fetchData()
  }

  // ─── CATEGORY ACTIONS ───
  const handleCreateCategory = async () => {
    if (!newCategory.name || !newCategory.slug) { setFormError('Kategori adı ve slug zorunlu'); return }
    if (categories.find(c => c.slug === newCategory.slug)) { setFormError('Bu slug zaten var'); return }
    setFormError('')
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ ...newCategory, sort_order: categories.length + 1 }),
    })
    setNewCategory({ name: '', slug: '', thickness: '', slogan: '', description: '', feature1: '', feature2: '', feature3: '' })
    setShowNewCategory(false)
    showSuccess('Kategori eklendi')
    fetchData()
  }

  const handleUpdateCategory = async () => {
    if (!editCategory) return

    // 1. Kaydet
    await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({
        id: editCategory.id,
        name: editCategory.name,
        slug: editCategory.slug,
        thickness: editCategory.thickness,
        slogan: editCategory.slogan,
        description: editCategory.description,
        feature1: editCategory.feature1,
        feature2: editCategory.feature2,
        feature3: editCategory.feature3,
      }),
    })
    showSuccess('Kategori güncellendi, çeviriler yapılıyor...')

    // 2. Otomatik 6 dile çevir (arka planda)
    const fieldsToTranslate: Record<string, string> = {}
    if (editCategory.slogan) fieldsToTranslate.slogan = editCategory.slogan
    if (editCategory.description) fieldsToTranslate.description = editCategory.description
    if (editCategory.feature1) fieldsToTranslate.feature1 = editCategory.feature1
    if (editCategory.feature2) fieldsToTranslate.feature2 = editCategory.feature2
    if (editCategory.feature3) fieldsToTranslate.feature3 = editCategory.feature3

    if (Object.keys(fieldsToTranslate).length > 0) {
      try {
        const trRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` },
          body: JSON.stringify({ fields: fieldsToTranslate }),
        })
        if (trRes.ok) {
          const translations = await trRes.json()
          // Çevirileri DB'ye kaydet
          await fetch('/api/categories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
            body: JSON.stringify({ id: editCategory.id, translations }),
          })
          showSuccess('Kategori güncellendi ve 6 dile çevrildi ✓')
        }
      } catch {
        // Çeviri başarısız olsa bile kayıt yapıldı
        console.warn('Kategori çevirisi başarısız')
      }
    }

    setEditCategory(null)
    fetchData()
  }

  if (loading) {
    return <div className="text-center py-20 text-white/30 font-mono text-sm">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/90 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-xl">
          <Check size={14} /> {successMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Ürün', val: products.length },
          { label: 'Taş Türü', val: stoneTypes.length },
          { label: 'Kategori', val: categories.length },
          { label: 'Resimli', val: products.filter(p => p.image_url).length },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white/30 text-[10px] font-mono uppercase">{s.label}</p>
            <p className="text-white text-2xl font-heading font-bold mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      {/* ═══════ TAŞ TÜRLERİ ═══════ */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-gold-400" />
            <h3 className="text-white font-heading font-semibold text-sm">Taş Türleri</h3>
          </div>
          <button onClick={() => { setShowNewStoneType(true); setFormError('') }}
            className="flex items-center gap-1.5 text-gold-400 text-xs font-mono hover:text-gold-300 transition-colors">
            <Plus size={12} /> Yeni Tür
          </button>
        </div>
        <p className="text-white/20 text-[10px] font-mono mb-4">📐 Önerilen: 800×600px (4:3) · JPG, PNG, WebP · Max 5MB</p>

        {showNewStoneType && (
          <div className="bg-white/[0.03] border border-gold-400/20 rounded-xl p-4 mb-4">
            <div className="flex gap-3 flex-wrap">
              <input type="text" value={newStoneType.name} onChange={(e) => setNewStoneType(p => ({ ...p, name: e.target.value }))}
                placeholder="Tür Adı (ör: Oniks)" className="flex-1 min-w-[140px] bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
              <input type="text" value={newStoneType.code} onChange={(e) => setNewStoneType(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="Kod (ör: ONKS)" className="w-28 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
              <button onClick={handleCreateStoneType} className="px-4 py-2 bg-white text-black rounded-xl text-xs font-medium hover:bg-stone-200">Ekle</button>
              <button onClick={() => { setShowNewStoneType(false); setFormError('') }} className="p-2 text-white/30 hover:text-white"><X size={14} /></button>
            </div>
            {formError && <p className="text-red-400 text-xs mt-2">{formError}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stoneTypes.map(st => {
            const count = products.filter(p => p.stone_type?.code === st.code).length
            return (
              <div key={st.id} className="group relative rounded-xl overflow-hidden hover:ring-1 hover:ring-white/20 transition-all">
                <div className="aspect-[4/3] bg-white/[0.04] relative overflow-hidden">
                  {getStoneTypeImage(st) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getStoneTypeImage(st)!} alt={st.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <ImageIcon size={24} className="text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => triggerUpload(st.id, 'stone_type')} className="p-2 rounded-full bg-white/20 hover:bg-white/40" title="Resim"><Camera size={14} className="text-white" /></button>
                    <button onClick={() => setEditStoneType({ ...st })} className="p-2 rounded-full bg-blue-500/30 hover:bg-blue-500/60" title="Düzenle"><Edit3 size={14} className="text-white" /></button>
                    <button onClick={() => setDeleteConfirm({ id: st.id, type: 'stone_type', name: st.name })} className="p-2 rounded-full bg-red-500/30 hover:bg-red-500/60" title="Sil"><Trash2 size={14} className="text-white" /></button>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                    <span className="text-gold-400 text-[9px] font-mono font-bold">{st.code}</span>
                  </div>
                </div>
                <div className="bg-white/[0.03] p-3">
                  <h4 className="text-white text-sm font-heading font-semibold">{st.name}</h4>
                  <p className="text-white/30 text-[10px] font-mono mt-0.5">{count} ürün</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══════ KATEGORİLER ═══════ */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Grid3X3 size={16} className="text-purple-400" />
            <h3 className="text-white font-heading font-semibold text-sm">Kategoriler</h3>
          </div>
          <button onClick={() => { setShowNewCategory(true); setFormError('') }}
            className="flex items-center gap-1.5 text-gold-400 text-xs font-mono hover:text-gold-300 transition-colors">
            <Plus size={12} /> Yeni Kategori
          </button>
        </div>
        <p className="text-white/20 text-[10px] font-mono mb-4">📐 Önerilen: 600×600px (kare) · JPG, PNG, WebP · Max 5MB</p>

        {showNewCategory && (
          <div className="bg-white/[0.03] border border-gold-400/20 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex gap-3 flex-wrap">
              <input type="text" value={newCategory.name} onChange={(e) => setNewCategory(p => ({ ...p, name: e.target.value }))}
                placeholder="Kategori Adı (ör: Wave)" className="flex-1 min-w-[140px] bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
              <input type="text" value={newCategory.slug} onChange={(e) => setNewCategory(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                placeholder="Slug (ör: wave)" className="w-28 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
              <input type="text" value={newCategory.thickness} onChange={(e) => setNewCategory(p => ({ ...p, thickness: e.target.value }))}
                placeholder="Kalınlık (ör: 1.5 – 3 cm)" className="w-44 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
            </div>
            <input type="text" value={newCategory.slogan} onChange={(e) => setNewCategory(p => ({ ...p, slogan: e.target.value }))}
              placeholder="Slogan (ör: Doğanın ham güzelliği)" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
            <textarea value={newCategory.description} onChange={(e) => setNewCategory(p => ({ ...p, description: e.target.value }))}
              placeholder="Açıklama metni..." rows={2} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 resize-none" />
            <div className="grid grid-cols-3 gap-3">
              <input type="text" value={newCategory.feature1} onChange={(e) => setNewCategory(p => ({ ...p, feature1: e.target.value }))}
                placeholder="• Özellik 1" className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
              <input type="text" value={newCategory.feature2} onChange={(e) => setNewCategory(p => ({ ...p, feature2: e.target.value }))}
                placeholder="• Özellik 2" className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
              <input type="text" value={newCategory.feature3} onChange={(e) => setNewCategory(p => ({ ...p, feature3: e.target.value }))}
                placeholder="• Özellik 3" className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreateCategory} className="px-4 py-2 bg-white text-black rounded-xl text-xs font-medium hover:bg-stone-200">Ekle</button>
              <button onClick={() => { setShowNewCategory(false); setFormError('') }} className="px-4 py-2 text-white/30 text-xs hover:text-white">İptal</button>
            </div>
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map(cat => {
            const count = products.filter(p => p.category?.slug === cat.slug).length
            return (
              <div key={cat.id} className="group relative rounded-xl overflow-hidden hover:ring-1 hover:ring-white/20 transition-all">
                <div className="aspect-square bg-white/[0.04] relative overflow-hidden">
                  {cat.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <ImageIcon size={24} className="text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => triggerUpload(cat.id, 'category')} className="p-2 rounded-full bg-white/20 hover:bg-white/40" title="Resim"><Camera size={14} className="text-white" /></button>
                    <button onClick={() => setEditCategory({ ...cat })} className="p-2 rounded-full bg-blue-500/30 hover:bg-blue-500/60" title="Düzenle"><Edit3 size={14} className="text-white" /></button>
                    <button onClick={() => setDeleteConfirm({ id: cat.id, type: 'category', name: cat.name })} className="p-2 rounded-full bg-red-500/30 hover:bg-red-500/60" title="Sil"><Trash2 size={14} className="text-white" /></button>
                  </div>
                </div>
                <div className="bg-white/[0.03] p-3">
                  <h4 className="text-white text-sm font-heading font-semibold">{cat.name}</h4>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-white/30 text-[10px] font-mono">{count} ürün</p>
                    {cat.thickness && <p className="text-gold-400/60 text-[9px] font-mono">{cat.thickness}</p>}
                  </div>
                  {cat.slogan && <p className="text-white/20 text-[9px] mt-1 truncate">{cat.slogan}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══════ ÜRÜNLER ═══════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ürün ara..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.12]" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none appearance-none">
            <option value="" className="bg-[#111]">Tüm Kategoriler</option>
            {categories.map(c => <option key={c.id} value={c.slug} className="bg-[#111]">{c.name}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none appearance-none">
            <option value="" className="bg-[#111]">Tüm Türler</option>
            {stoneTypes.map(st => <option key={st.id} value={st.code} className="bg-[#111]">{st.name}</option>)}
          </select>
        </div>
        <button onClick={() => { setShowNewProduct(true); setFormError('') }}
          className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors">
          <Plus size={16} /> Yeni Ürün
        </button>
      </div>

      {showNewProduct && (
        <div className="bg-white/[0.03] border border-gold-400/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium text-sm">Yeni Ürün Ekle</h3>
            <button onClick={() => setShowNewProduct(false)}><X size={16} className="text-white/40" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input type="text" value={newProduct.name} onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="Ürün Adı"
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
            <input type="text" value={newProduct.code} onChange={(e) => setNewProduct(p => ({ ...p, code: e.target.value }))} placeholder="Kod (ör: RKS 15)"
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
            <select value={newProduct.category_id} onChange={(e) => setNewProduct(p => ({ ...p, category_id: e.target.value }))}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none appearance-none">
              <option value="" className="bg-[#111]">Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id} className="bg-[#111]">{c.name}</option>)}
            </select>
            <select value={newProduct.stone_type_id} onChange={(e) => setNewProduct(p => ({ ...p, stone_type_id: e.target.value }))}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none appearance-none">
              <option value="" className="bg-[#111]">Taş Türü</option>
              {stoneTypes.map(st => <option key={st.id} value={st.id} className="bg-[#111]">{st.name} ({st.code})</option>)}
            </select>
          </div>
          {formError && <p className="mt-3 text-red-400 text-xs">{formError}</p>}
          <button onClick={handleCreateProduct} className="mt-4 inline-flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-xs font-medium hover:bg-stone-200"><Save size={12} /> Kaydet</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((product) => (
          <div key={product.id} className={`bg-white/[0.03] border rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all group ${!product.is_active ? 'opacity-40 border-red-500/20' : 'border-white/[0.06]'}`}>
            <div className="aspect-square bg-white/[0.04] relative flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <ImageIcon size={24} className="text-white/10" />
                  <span className="text-white/10 text-[9px] font-mono">Resim yükle</span>
                </div>
              )}
              {!product.is_active && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[9px] font-mono">PASİF</div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button onClick={() => triggerUpload(product.id, 'product')} className="p-2 rounded-full bg-white/20 hover:bg-white/40" title="Resim">
                  <Upload size={13} className="text-white" />
                </button>
                <button onClick={() => handleToggleProduct(product.id, product.is_active)} className="p-2 rounded-full bg-yellow-500/30 hover:bg-yellow-500/60" title={product.is_active ? 'Pasife Al' : 'Aktif Et'}>
                  {product.is_active ? <EyeOff size={13} className="text-white" /> : <Eye size={13} className="text-white" />}
                </button>
                <button onClick={() => setDeleteConfirm({ id: product.id, type: 'product', name: product.name })} className="p-2 rounded-full bg-red-500/30 hover:bg-red-500/60" title="Sil">
                  <Trash2 size={13} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-3 text-center">
              <h4 className="text-white text-sm font-heading font-semibold">{product.name}</h4>
              <p className="text-white/30 text-[10px] font-mono mt-0.5">{product.code}</p>
              <div className="flex justify-center gap-1 mt-2">
                <span className="px-1.5 py-0.5 rounded bg-gold-400/10 text-gold-400 text-[9px] font-mono">{product.stone_type?.code}</span>
                <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 text-[9px] font-mono">{product.category?.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-center py-12 text-white/20 font-mono text-sm">Ürün bulunamadı</div>}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file && uploadingId) handleImageUpload(file); e.target.value = '' }} />

      {/* ═══════ EDIT STONE TYPE MODAL ═══════ */}
      {editStoneType && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setEditStoneType(null)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-base font-semibold text-white mb-4">Taş Türü Düzenle</h3>
            <div className="space-y-3">
              <div>
                <label className="text-white/30 text-[10px] font-mono uppercase block mb-1">Tür Adı</label>
                <input type="text" value={editStoneType.name} onChange={(e) => setEditStoneType({ ...editStoneType, name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400/40" />
              </div>
              <div>
                <label className="text-white/30 text-[10px] font-mono uppercase block mb-1">Kod</label>
                <input type="text" value={editStoneType.code} onChange={(e) => setEditStoneType({ ...editStoneType, code: e.target.value.toUpperCase() })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400/40" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditStoneType(null)} className="flex-1 py-2.5 rounded-full border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.04]">İptal</button>
              <button onClick={handleUpdateStoneType} className="flex-1 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-stone-200">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ EDIT CATEGORY MODAL ═══════ */}
      {editCategory && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setEditCategory(null)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-base font-semibold text-white mb-4">Kategori Düzenle — {editCategory.name}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/30 text-[10px] font-mono uppercase block mb-1">Kategori Adı</label>
                  <input type="text" value={editCategory.name} onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400/40" />
                </div>
                <div>
                  <label className="text-white/30 text-[10px] font-mono uppercase block mb-1">Slug</label>
                  <input type="text" value={editCategory.slug} onChange={(e) => setEditCategory({ ...editCategory, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400/40" />
                </div>
              </div>
              <div>
                <label className="text-white/30 text-[10px] font-mono uppercase block mb-1">Kalınlık</label>
                <input type="text" value={editCategory.thickness || ''} onChange={(e) => setEditCategory({ ...editCategory, thickness: e.target.value })}
                  placeholder="ör: 1.5 – 3 cm" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
              </div>
              <div>
                <label className="text-white/30 text-[10px] font-mono uppercase block mb-1">Slogan</label>
                <input type="text" value={editCategory.slogan || ''} onChange={(e) => setEditCategory({ ...editCategory, slogan: e.target.value })}
                  placeholder="ör: Doğanın ham güzelliği" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
              </div>
              <div>
                <label className="text-white/30 text-[10px] font-mono uppercase block mb-1">Açıklama</label>
                <textarea value={editCategory.description || ''} onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                  placeholder="Detaylı açıklama..." rows={3} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 resize-none" />
              </div>
              <div>
                <label className="text-white/30 text-[10px] font-mono uppercase block mb-1">Özellikler (3 nokta)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" value={editCategory.feature1 || ''} onChange={(e) => setEditCategory({ ...editCategory, feature1: e.target.value })}
                    placeholder="• Özellik 1" className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
                  <input type="text" value={editCategory.feature2 || ''} onChange={(e) => setEditCategory({ ...editCategory, feature2: e.target.value })}
                    placeholder="• Özellik 2" className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
                  <input type="text" value={editCategory.feature3 || ''} onChange={(e) => setEditCategory({ ...editCategory, feature3: e.target.value })}
                    placeholder="• Özellik 3" className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditCategory(null)} className="flex-1 py-2.5 rounded-full border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.04]">İptal</button>
              <button onClick={handleUpdateCategory} className="flex-1 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-stone-200">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ DELETE CONFIRM ═══════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-base font-semibold text-white mb-2">
              {deleteConfirm.type === 'product' ? 'Ürünü' : deleteConfirm.type === 'stone_type' ? 'Taş Türünü' : 'Kategoriyi'} Sil
            </h3>
            <p className="text-white/40 text-sm mb-1">
              <span className="text-white font-medium">{deleteConfirm.name}</span> silinecek.
            </p>
            {deleteConfirm.type !== 'product' && (
              <p className="text-red-400/70 text-xs mb-4">⚠️ Bu işlem geri alınamaz. İlişkili ürünler etkilenebilir.</p>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-full border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.04]">İptal</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm hover:bg-red-600">Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
