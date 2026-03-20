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
  ChevronDown,
} from 'lucide-react'

interface StoneType {
  id: string
  name: string
  code: string
  sort_order: number
}

interface Category {
  id: string
  name: string
  slug: string
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

  // New product form
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', code: '', category_id: '', stone_type_id: '' })

  // New stone type form
  const [showNewStoneType, setShowNewStoneType] = useState(false)
  const [newStoneType, setNewStoneType] = useState({ name: '', code: '' })

  // Image upload
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const password = typeof window !== 'undefined' ? localStorage.getItem('admin_pw') || '' : ''

  const fetchData = async () => {
    setLoading(true)
    const [prods, cats, types] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/stone-types').then(r => r.json()),
    ])
    setProducts(prods)
    setCategories(cats)
    setStoneTypes(types)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !filterCategory || p.category?.slug === filterCategory
    const matchType = !filterType || p.stone_type?.code === filterType
    return matchSearch && matchCategory && matchType
  })

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.code || !newProduct.category_id || !newProduct.stone_type_id) {
      setFormError('Tüm alanları doldurun')
      return
    }
    // Check if code already exists
    const existing = products.find(p => p.code.toLowerCase() === newProduct.code.toLowerCase())
    if (existing) {
      setFormError(`"${newProduct.code}" kodu zaten kullanılıyor (${existing.name})`)
      return
    }
    setFormError('')
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(newProduct),
    })
    if (!res.ok) {
      const data = await res.json()
      setFormError(data.error || 'Ürün eklenirken hata oluştu')
      return
    }
    setNewProduct({ name: '', code: '', category_id: '', stone_type_id: '' })
    setShowNewProduct(false)
    fetchData()
  }

  const handleDeleteProduct = async (id: string) => {
    await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    })
    setDeleteConfirm(null)
    fetchData()
  }

  const handleImageUpload = async (productId: string, file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Sadece JPG, PNG veya WebP formatında resim yükleyebilirsiniz')
      return
    }
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('Resim boyutu en fazla 5MB olabilir')
      return
    }
    setUploadingId(productId)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('product_id', productId)

    const res = await fetch('/api/products/upload', {
      method: 'POST',
      headers: { 'x-admin-password': password },
      body: formData,
    })

    if (!res.ok) {
      alert('Resim yüklenirken hata oluştu')
    }
    setUploadingId(null)
    fetchData()
  }

  const handleCreateStoneType = async () => {
    if (!newStoneType.name || !newStoneType.code) {
      setFormError('Tür adı ve kodu zorunludur')
      return
    }
    const existing = stoneTypes.find(st => st.code.toLowerCase() === newStoneType.code.toLowerCase())
    if (existing) {
      setFormError(`"${newStoneType.code}" kodu zaten kullanılıyor (${existing.name})`)
      return
    }
    setFormError('')
    const res = await fetch('/api/stone-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ ...newStoneType, sort_order: stoneTypes.length + 1 }),
    })
    if (!res.ok) {
      const data = await res.json()
      setFormError(data.error || 'Tür eklenirken hata oluştu')
      return
    }
    setNewStoneType({ name: '', code: '' })
    setShowNewStoneType(false)
    fetchData()
  }

  if (loading) {
    return <div className="text-center py-20 text-white/30 font-mono text-sm">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/30 text-[10px] font-mono uppercase">Toplam Ürün</p>
          <p className="text-white text-2xl font-heading font-bold mt-1">{products.length}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/30 text-[10px] font-mono uppercase">Taş Türü</p>
          <p className="text-white text-2xl font-heading font-bold mt-1">{stoneTypes.length}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/30 text-[10px] font-mono uppercase">Kategori</p>
          <p className="text-white text-2xl font-heading font-bold mt-1">{categories.length}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/30 text-[10px] font-mono uppercase">Resimli</p>
          <p className="text-white text-2xl font-heading font-bold mt-1">
            {products.filter(p => p.image_url).length}
          </p>
        </div>
      </div>

      {/* Stone Types Section */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium text-sm">Taş Türleri</h3>
          <button
            onClick={() => setShowNewStoneType(true)}
            className="flex items-center gap-1.5 text-gold-400 text-xs font-mono hover:text-gold-300 transition-colors"
          >
            <Plus size={12} /> Yeni Tür
          </button>
        </div>

        {showNewStoneType && (
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newStoneType.name}
              onChange={(e) => setNewStoneType(p => ({ ...p, name: e.target.value }))}
              placeholder="Tür Adı (ör: Oniks)"
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40"
            />
            <input
              type="text"
              value={newStoneType.code}
              onChange={(e) => setNewStoneType(p => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="Kod (ör: ONKS)"
              className="w-28 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40"
            />
            <button onClick={handleCreateStoneType} className="px-4 py-2 bg-white text-black rounded-xl text-xs font-medium hover:bg-stone-200 transition-colors">
              Ekle
            </button>
            <button onClick={() => { setShowNewStoneType(false); setFormError('') }} className="p-2 text-white/30 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
        {showNewStoneType && formError && (
          <p className="text-red-400 text-xs mb-4 -mt-2">{formError}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {stoneTypes.map(st => (
            <span key={st.id} className="px-3 py-1.5 rounded-full bg-gold-400/10 text-gold-400 text-xs font-mono">
              {st.name} ({st.code}) — {products.filter(p => p.stone_type?.code === st.code).length} ürün
            </span>
          ))}
        </div>
      </div>

      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.12]"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none appearance-none"
          >
            <option value="" className="bg-[#111]">Tüm Kategoriler</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug} className="bg-[#111]">{c.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none appearance-none"
          >
            <option value="" className="bg-[#111]">Tüm Türler</option>
            {stoneTypes.map(st => (
              <option key={st.id} value={st.code} className="bg-[#111]">{st.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowNewProduct(true)}
          className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
        >
          <Plus size={16} /> Yeni Ürün
        </button>
      </div>

      {/* New Product Form */}
      {showNewProduct && (
        <div className="bg-white/[0.03] border border-gold-400/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium text-sm">Yeni Ürün Ekle</h3>
            <button onClick={() => setShowNewProduct(false)}>
              <X size={16} className="text-white/40" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))}
              placeholder="Ürün Adı"
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40"
            />
            <input
              type="text"
              value={newProduct.code}
              onChange={(e) => setNewProduct(p => ({ ...p, code: e.target.value }))}
              placeholder="Kod (ör: RKS 15)"
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40"
            />
            <select
              value={newProduct.category_id}
              onChange={(e) => setNewProduct(p => ({ ...p, category_id: e.target.value }))}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none appearance-none"
            >
              <option value="" className="bg-[#111]">Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} className="bg-[#111]">{c.name}</option>
              ))}
            </select>
            <select
              value={newProduct.stone_type_id}
              onChange={(e) => setNewProduct(p => ({ ...p, stone_type_id: e.target.value }))}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none appearance-none"
            >
              <option value="" className="bg-[#111]">Taş Türü</option>
              {stoneTypes.map(st => (
                <option key={st.id} value={st.id} className="bg-[#111]">{st.name} ({st.code})</option>
              ))}
            </select>
          </div>
          {formError && (
            <p className="mt-3 text-red-400 text-xs">{formError}</p>
          )}
          <button
            onClick={handleCreateProduct}
            className="mt-4 inline-flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-xs font-medium hover:bg-stone-200 transition-colors"
          >
            <Save size={12} /> Kaydet
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all group"
          >
            {/* Image */}
            <div className="aspect-square bg-white/[0.04] relative flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={24} className="text-white/10" />
              )}

              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setUploadingId(product.id)
                    fileInputRef.current?.click()
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                  title="Resim Yükle"
                >
                  {uploadingId === product.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload size={14} className="text-white" />
                  )}
                </button>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="p-2 rounded-full bg-red-500/30 hover:bg-red-500/60 transition-colors"
                  title="Sil"
                >
                  <Trash2 size={14} className="text-white" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 text-center">
              <h4 className="text-white text-sm font-heading font-semibold">{product.name}</h4>
              <p className="text-white/30 text-[10px] font-mono mt-0.5">{product.code}</p>
              <div className="flex justify-center gap-1 mt-2">
                <span className="px-1.5 py-0.5 rounded bg-gold-400/10 text-gold-400 text-[9px] font-mono">
                  {product.stone_type?.code}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 text-[9px] font-mono">
                  {product.category?.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-white/20 font-mono text-sm">Ürün bulunamadı</div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && uploadingId) {
            handleImageUpload(uploadingId, file)
          }
          e.target.value = ''
        }}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-base font-semibold text-white mb-2">Ürünü Sil</h3>
            <p className="text-white/40 text-sm mb-6">
              Bu ürünü silmek istediğinize emin misiniz?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-full border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.04] transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm)}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
