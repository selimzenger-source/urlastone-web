'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  MapPin,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Navigation,
  Upload,
  Loader2,
  Calendar,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import type { Project } from '@/types/project'

const AdminMapPicker = dynamic(() => import('./AdminMapPicker'), { ssr: false })

const kategoriler = ['Konut', 'Ticari', 'Otel', 'Villa', 'Kamu', 'Peyzaj', 'Diğer']
const uygulamaTipleri = ['Derzsiz', 'Derzli']

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
  } catch {
    return dateStr
  }
}

interface Props {
  adminPassword: string
}

interface EditProject {
  id?: string
  project_name: string
  city: string
  country: string
  address: string
  lat: number
  lng: number
  description: string
  category: string
  product: string
  application_type: string
  contractor: string
  project_date: string
  photos: string[]
  active: boolean
  display_order: number
}

const emptyProject: EditProject = {
  project_name: '',
  city: '',
  country: 'Türkiye',
  address: '',
  lat: 0,
  lng: 0,
  description: '',
  category: '',
  product: '',
  application_type: '',
  contractor: '',
  project_date: '',
  photos: [],
  active: true,
  display_order: 0,
}

export default function AdminProjeler({ adminPassword }: Props) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editProject, setEditProject] = useState<EditProject | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [products, setProducts] = useState<{ id: string; name: string; code: string }[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [mapsUrl, setMapsUrl] = useState('')
  const productDropdownRef = useRef<HTMLDivElement>(null)

  const headers = {
    'Authorization': `Bearer ${adminPassword}`,
    'Content-Type': 'application/json',
  }

  // Projeleri yükle
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch {
      // API henüz ayarlanmadıysa boş göster
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  // Ürünleri yükle (tam isim: "RKS-1 Classic Nature Rockshell" formatında)
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setProducts(data.map((p: any) => {
        // Kod: "RKS 1" → "RKS-1"
        const code = (p.code || '').replace(/\s+/g, '-')
        // Kategori slug'ına göre tam isim oluştur
        const catSlug = p.category?.slug || ''
        let fullName = p.name || ''
        // RKS (nature) ürünlerinde "Nature" isimde yok, ekle
        if (catSlug === 'nature' && !fullName.toLowerCase().includes('nature')) {
          fullName = `${fullName} Nature`
        }
        // Tüm ürünlere "Rockshell" ekle
        if (!fullName.toLowerCase().includes('rockshell')) {
          fullName = `${fullName} Rockshell`
        }
        return { id: p.id, name: fullName, code }
      }))
    }).catch(() => {})
  }, [])

  // Click outside to close product dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Google Maps URL'den koordinat çek
  const parseGoogleMapsUrl = (url: string) => {
    const text = decodeURIComponent(url)
    const patterns = [
      /@(-?\d+\.?\d+),(-?\d+\.?\d+)/,                    // @38.123,26.456
      /!3d(-?\d+\.?\d+)!4d(-?\d+\.?\d+)/,                // !3d38.123!4d26.456
      /q=(-?\d+\.?\d+),(-?\d+\.?\d+)/,                   // q=38.123,26.456
      /center=(-?\d+\.?\d+),(-?\d+\.?\d+)/,              // center=38.123,26.456
      /ll=(-?\d+\.?\d+),(-?\d+\.?\d+)/,                  // ll=38.123,26.456
      /place\/[^/]*\/@(-?\d+\.?\d+),(-?\d+\.?\d+)/,      // place/Name/@38.123,26.456
      /(-?\d{1,3}\.\d{4,}),\s*(-?\d{1,3}\.\d{4,})/,     // any lat,lng pair with 4+ decimals
    ]
    for (const p of patterns) {
      const m = text.match(p)
      if (m) {
        const lat = parseFloat(m[1])
        const lng = parseFloat(m[2])
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng }
        }
      }
    }
    return null
  }

  const [mapsError, setMapsError] = useState('')
  const [searchingLocation, setSearchingLocation] = useState(false)

  const handleMapsUrl = async () => {
    if (!mapsUrl.trim() || !editProject) return
    setSearchingLocation(true)
    setMapsError('')

    try {
      // Önce client-side URL parse dene (hızlı)
      const coords = parseGoogleMapsUrl(mapsUrl)
      if (coords) {
        // Koordinatları bulduk, ters geocoding ile şehir/ülke al
        const revRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`,
          { headers: { 'Accept-Language': 'tr', 'User-Agent': 'UrlastoneAdmin/1.0' } }
        )
        const revData = await revRes.json()
        const addr = revData?.address || {}
        const city = addr.province || addr.city || addr.town || addr.county || ''
        const country = addr.country || 'Türkiye'
        const district = addr.suburb || addr.district || addr.town || addr.village || ''
        const shortAddress = [district, city].filter(Boolean).join(', ')

        setEditProject({
          ...editProject,
          lat: coords.lat,
          lng: coords.lng,
          city: city || editProject.city,
          country: country || editProject.country,
          address: shortAddress || editProject.address,
        })
        setMapsUrl('')
        setSearchingLocation(false)
        return
      }

      // Client-side bulamadı - sunucu tarafı API kullan
      const isUrl = mapsUrl.includes('google.com/maps') || mapsUrl.includes('goo.gl') || mapsUrl.includes('maps.app')
      const body = isUrl ? { url: mapsUrl } : { query: mapsUrl }

      const res = await fetch('/api/resolve-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.lat && data.lng) {
          // Eğer API şehir/ülke döndüyse kullan, yoksa ters geocoding yap
          let city = data.city || ''
          let country = data.country || 'Türkiye'
          let address = data.address || ''

          if (!city && data.lat) {
            const revRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.lat}&lon=${data.lng}&addressdetails=1`,
              { headers: { 'Accept-Language': 'tr', 'User-Agent': 'UrlastoneAdmin/1.0' } }
            )
            const revData = await revRes.json()
            const addr = revData?.address || {}
            city = addr.province || addr.city || addr.town || addr.county || ''
            country = addr.country || 'Türkiye'
            const district = addr.suburb || addr.district || addr.town || addr.village || ''
            address = [district, city].filter(Boolean).join(', ')
          }

          setEditProject({
            ...editProject,
            lat: data.lat,
            lng: data.lng,
            city: city || editProject.city,
            country: country || editProject.country,
            address: address || editProject.address,
          })
          setMapsUrl('')
          setMapsError('')
        } else {
          setMapsError('Konum bulunamadı. Mekan adını yazarak deneyin.')
        }
      } else {
        setMapsError('Konum bulunamadı. Mekan adını yazarak deneyin.')
      }
    } catch {
      setMapsError('Arama hatası. Tekrar deneyin.')
    } finally {
      setSearchingLocation(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 8)

  const filtered = projects.filter((p) =>
    p.project_name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => {
    setEditProject({ ...emptyProject, display_order: projects.length + 1 })
    setIsNew(true)
    setPendingFiles([])
    setShowMap(false)
  }

  const openEdit = (project: Project) => {
    setEditProject({
      id: project.id,
      project_name: project.project_name,
      city: project.city,
      country: project.country || 'Türkiye',
      address: project.address || '',
      lat: project.lat,
      lng: project.lng,
      description: project.description || '',
      category: project.category,
      product: project.product || '',
      application_type: project.application_type || '',
      contractor: project.contractor || '',
      project_date: project.project_date || '',
      photos: project.photos || [],
      active: project.active,
      display_order: project.display_order,
    })
    setIsNew(false)
    setPendingFiles([])
    setShowMap(false)
  }

  // Fotoğraf yükle
  const uploadPhotos = async (projectId: string, files: File[]): Promise<string[]> => {
    if (!files.length) return []
    setUploading(true)
    const formData = new FormData()
    formData.append('projectId', projectId)
    files.forEach((file) => formData.append('files', file))

    try {
      const res = await fetch('/api/projects/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminPassword}` },
        body: formData,
      })
      const data = await res.json()
      return data.urls || []
    } catch {
      return []
    } finally {
      setUploading(false)
    }
  }

  // Otomatik çeviri
  const translateProject = async (projectId: string, project_name: string, description: string) => {
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ project_name, description }),
      })
      if (!res.ok) return
      const translations = await res.json()
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ translations }),
      })
    } catch {
      // Çeviri başarısız olursa sessizce devam et
    }
  }

  // Kaydet
  const saveProject = async () => {
    if (!editProject || !editProject.project_name.trim() || !editProject.city.trim()) return
    setSaving(true)

    try {
      if (isNew) {
        // Yeni proje oluştur
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            project_name: editProject.project_name,
            city: editProject.city,
            country: editProject.country || 'Türkiye',
            address: editProject.address || null,
            lat: editProject.lat,
            lng: editProject.lng,
            description: editProject.description || null,
            category: editProject.category,
            product: editProject.product || null,
            application_type: editProject.application_type || null,
            contractor: editProject.contractor || null,
            project_date: editProject.project_date || null,
            photos: [],
            active: editProject.active,
            display_order: editProject.display_order,
          }),
        })
        const newProject = await res.json()
        if (!res.ok) { alert('Kaydetme hatası: ' + (newProject.error || 'Bilinmeyen hata')); return }

        // Fotoğrafları yükle
        if (pendingFiles.length && newProject.id) {
          const urls = await uploadPhotos(newProject.id, pendingFiles)
          if (urls.length) {
            await fetch(`/api/projects/${newProject.id}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({ photos: urls }),
            })
          }
        }

        // Otomatik çeviri (arka planda)
        if (newProject.id && (editProject.project_name || editProject.description)) {
          translateProject(newProject.id, editProject.project_name, editProject.description)
        }
      } else if (editProject.id) {
        // Fotoğrafları yükle
        let newPhotoUrls: string[] = []
        if (pendingFiles.length) {
          newPhotoUrls = await uploadPhotos(editProject.id, pendingFiles)
        }

        const updateRes = await fetch(`/api/projects/${editProject.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            project_name: editProject.project_name,
            city: editProject.city,
            country: editProject.country || 'Türkiye',
            address: editProject.address || null,
            lat: editProject.lat,
            lng: editProject.lng,
            description: editProject.description || null,
            category: editProject.category,
            product: editProject.product || null,
            application_type: editProject.application_type || null,
            contractor: editProject.contractor || null,
            project_date: editProject.project_date || null,
            photos: [...editProject.photos, ...newPhotoUrls],
            active: editProject.active,
            display_order: editProject.display_order,
          }),
        })
        if (!updateRes.ok) {
          const errData = await updateRes.json().catch(() => ({}))
          alert('Güncelleme hatası: ' + (errData.error || updateRes.statusText))
          return
        }

        // Otomatik çeviri (arka planda)
        if (editProject.project_name || editProject.description) {
          translateProject(editProject.id, editProject.project_name, editProject.description)
        }
      }

      await fetchProjects()
      setEditProject(null)
      setPendingFiles([])
    } catch (err) {
      alert('Bir hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'))
    } finally {
      setSaving(false)
    }
  }

  // Sil
  const deleteProject = async (id: string) => {
    await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers,
    })
    await fetchProjects()
    setDeleteConfirm(null)
  }

  // Aktif/Pasif toggle
  const toggleActive = async (project: Project) => {
    await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ active: !project.active }),
    })
    await fetchProjects()
  }

  // Dosya seçildiğinde
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPendingFiles((prev) => [...prev, ...files])
    e.target.value = ''
  }

  // Mevcut fotoğrafı kaldır
  const removePhoto = (index: number) => {
    if (!editProject) return
    setEditProject({
      ...editProject,
      photos: editProject.photos.filter((_, i) => i !== index),
    })
  }

  // Bekleyen dosyayı kaldır
  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-white/40 text-xs font-mono">
            {projects.length} proje · {projects.filter((p) => p.active).length} aktif
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
        >
          <Plus size={16} />
          Yeni Proje Ekle
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Proje adı, şehir veya kategori ara..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.12] transition-colors"
        />
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-16">
          <MapPin size={40} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/30 text-sm mb-2">Henüz proje eklenmemiş</p>
          <p className="text-white/15 text-xs font-mono">
            Supabase bağlantısını ayarlayıp ilk projenizi ekleyin
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <div
            key={project.id}
            className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all ${
              project.active ? 'border-white/[0.06]' : 'border-white/[0.03] opacity-50'
            }`}
          >
            {/* Photo or Placeholder */}
            <div className="aspect-[16/10] bg-white/[0.04] relative overflow-hidden">
              {project.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.photos[0]}
                  alt={project.project_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon size={32} className="text-white/10" />
                </div>
              )}
              {!project.active && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-red-400/10 text-red-400 text-[10px] font-mono">
                  Pasif
                </div>
              )}
              {project.photos?.length > 1 && (
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono">
                  {project.photos.length} foto
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-white font-medium text-sm">{project.project_name}</h4>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={11} className="text-gold-400 flex-shrink-0" />
                <p className="text-white/30 text-xs font-mono truncate">{project.city}{project.country && project.country !== 'Türkiye' ? `, ${project.country}` : ''}</p>
              </div>
              {project.product && (
                <p className="text-white/50 text-[11px] font-mono mb-1 truncate">{project.product}</p>
              )}
              {project.description && (
                <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {project.category && (
                  <span className="px-2 py-0.5 rounded-full bg-gold-400/10 text-gold-400 text-[10px] font-mono">
                    {project.category}
                  </span>
                )}
                {project.application_type && (
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40 text-[10px] font-mono">
                    {project.application_type}
                  </span>
                )}
                {project.project_date && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40 text-[10px] font-mono">
                    <Calendar size={9} />
                    {formatDate(project.project_date)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 mt-3 border-t border-white/[0.06]">
                <button
                  onClick={() => openEdit(project)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.04] text-white/50 text-xs hover:bg-white/[0.08] hover:text-white transition-all"
                >
                  <Edit3 size={12} />
                  Düzenle
                </button>
                <button
                  onClick={() => toggleActive(project)}
                  className="p-2 rounded-lg bg-white/[0.04] text-white/30 hover:bg-white/[0.08] hover:text-white transition-all"
                  title={project.active ? 'Pasife Al' : 'Aktife Al'}
                >
                  {project.active ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => setDeleteConfirm(project.id)}
                  className="p-2 rounded-lg bg-white/[0.04] text-white/30 hover:bg-red-400/10 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-base font-semibold text-white mb-2">Projeyi Sil</h3>
            <p className="text-white/40 text-sm mb-6">
              Bu projeyi ve fotoğraflarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-full border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.04] transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => deleteConfirm && deleteProject(deleteConfirm)}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / New Modal */}
      {editProject && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start md:items-center justify-center p-0 md:p-4 overflow-y-auto" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) setEditProject(null) }}>
          <div
            className="bg-[#111] border-0 md:border border-white/[0.08] md:rounded-2xl w-full max-w-lg min-h-screen md:min-h-0 md:max-h-[90vh] overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#111] flex items-center justify-between p-4 md:p-6 border-b border-white/[0.06]">
              <h3 className="font-heading text-lg font-semibold text-white">
                {isNew ? 'Yeni Proje Ekle' : 'Projeyi Düzenle'}
              </h3>
              <button onClick={() => !saving && setEditProject(null)} className="text-white/40 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 md:p-6 space-y-4">
              {/* Proje Adı */}
              <div>
                <label className="block text-white/40 text-xs font-mono mb-1.5">Proje Adı *</label>
                <input
                  type="text"
                  value={editProject.project_name}
                  onChange={(e) => setEditProject({ ...editProject, project_name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors"
                  placeholder="ör. Kalyon Kartal Konutları"
                />
              </div>

              {/* Ürün - Autocomplete */}
              <div ref={productDropdownRef} className="relative">
                <label className="block text-white/40 text-xs font-mono mb-1.5">Ürün</label>
                <input
                  type="text"
                  value={editProject.product}
                  onChange={(e) => {
                    setEditProject({ ...editProject, product: e.target.value })
                    setProductSearch(e.target.value)
                    setShowProductDropdown(true)
                  }}
                  onFocus={() => {
                    setProductSearch(editProject.product)
                    setShowProductDropdown(true)
                  }}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors"
                  placeholder="Ürün adı veya kodu yazın..."
                />
                {showProductDropdown && filteredProducts.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/[0.1] rounded-xl shadow-xl max-h-52 overflow-y-auto">
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setEditProject({ ...editProject, product: `${p.code} ${p.name}` })
                          setShowProductDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/[0.06] transition-colors border-b border-white/[0.04] last:border-0"
                      >
                        <span className="text-gold-400 text-xs font-mono">{p.code}</span>
                        <span className="text-white text-sm ml-2">{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Uygulama Tipi & Kategori */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/40 text-xs font-mono mb-1.5">Uygulama Tipi</label>
                  <select
                    value={editProject.application_type}
                    onChange={(e) => setEditProject({ ...editProject, application_type: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/[0.15] transition-colors appearance-none"
                  >
                    <option value="" className="bg-[#111]">Seçin</option>
                    {uygulamaTipleri.map((t) => (
                      <option key={t} value={t} className="bg-[#111]">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/40 text-xs font-mono mb-1.5">Kategori</label>
                  <select
                    value={editProject.category}
                    onChange={(e) => setEditProject({ ...editProject, category: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/[0.15] transition-colors appearance-none"
                  >
                    <option value="" className="bg-[#111]">Seçin</option>
                    {kategoriler.map((k) => (
                      <option key={k} value={k} className="bg-[#111]">{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Yapılan Firma & Tarih */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/40 text-xs font-mono mb-1.5">Yapılan Firma</label>
                  <input
                    type="text"
                    value={editProject.contractor}
                    onChange={(e) => setEditProject({ ...editProject, contractor: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors"
                    placeholder="ör. Ery Yapı"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs font-mono mb-1.5">Teslim Tarihi</label>
                  <input
                    type="date"
                    value={editProject.project_date}
                    onChange={(e) => setEditProject({ ...editProject, project_date: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/[0.15] transition-colors"
                  />
                </div>
              </div>

              {/* Şehir & Ülke */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/40 text-xs font-mono mb-1.5">Şehir *</label>
                  <input
                    type="text"
                    value={editProject.city}
                    onChange={(e) => setEditProject({ ...editProject, city: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors"
                    placeholder="ör. İstanbul"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs font-mono mb-1.5">Ülke</label>
                  <input
                    type="text"
                    value={editProject.country}
                    onChange={(e) => setEditProject({ ...editProject, country: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors"
                    placeholder="ör. Türkiye"
                  />
                </div>
              </div>

              {/* Adres */}
              <div>
                <label className="block text-white/40 text-xs font-mono mb-1.5">Adres</label>
                <input
                  type="text"
                  value={editProject.address}
                  onChange={(e) => setEditProject({ ...editProject, address: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors"
                  placeholder="ör. Kartal, Yakacık Mah. No: 45"
                />
              </div>

              {/* Konum - Google Maps URL veya Harita */}
              <div>
                <label className="block text-white/40 text-xs font-mono mb-1.5">Konum</label>

                {/* Konum Ara */}
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleMapsUrl())}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors"
                    placeholder="Google Maps linki yapıştır veya mekan adı yaz..."
                  />
                  <button
                    type="button"
                    onClick={handleMapsUrl}
                    disabled={searchingLocation}
                    className="px-4 py-2.5 bg-gold-400/20 text-gold-400 rounded-xl text-xs font-mono hover:bg-gold-400/30 transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {searchingLocation ? '...' : 'Bul'}
                  </button>
                </div>

                {mapsError && (
                  <p className="text-red-400 text-[10px] font-mono mb-2">{mapsError}</p>
                )}

                {/* Koordinat gösterimi */}
                {(editProject.lat !== 0 || editProject.lng !== 0) && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-green-400/[0.06] border border-green-400/[0.12] rounded-xl">
                    <MapPin size={14} className="text-green-400" />
                    <span className="text-green-400 text-xs font-mono">{editProject.lat.toFixed(6)}, {editProject.lng.toFixed(6)}</span>
                    <button
                      type="button"
                      onClick={() => setEditProject({ ...editProject, lat: 0, lng: 0 })}
                      className="ml-auto text-white/30 hover:text-red-400 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Enlem Boylam gizli inputlar */}
                <div className="flex gap-3 mb-2">
                  <input
                    type="number"
                    step="any"
                    value={editProject.lat || ''}
                    onChange={(e) => setEditProject({ ...editProject, lat: parseFloat(e.target.value) || 0 })}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors font-mono"
                    placeholder="Enlem"
                  />
                  <input
                    type="number"
                    step="any"
                    value={editProject.lng || ''}
                    onChange={(e) => setEditProject({ ...editProject, lng: parseFloat(e.target.value) || 0 })}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors font-mono"
                    placeholder="Boylam"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/[0.12] text-white/40 text-xs hover:border-gold-400/30 hover:text-gold-400 transition-all"
                >
                  <Navigation size={14} />
                  {showMap ? 'Haritayı Gizle' : 'Haritadan Konum Seç'}
                </button>
                {showMap && (
                  <div className="mt-3 h-[250px] md:h-[300px] rounded-xl overflow-hidden border border-white/[0.06]">
                    <AdminMapPicker
                      lat={editProject.lat}
                      lng={editProject.lng}
                      onSelect={(lat, lng) => setEditProject({ ...editProject, lat, lng })}
                    />
                  </div>
                )}
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-white/40 text-xs font-mono mb-1.5">Açıklama</label>
                <textarea
                  value={editProject.description}
                  onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors resize-none"
                  placeholder="Proje hakkında kısa açıklama..."
                />
              </div>

              {/* Fotoğraflar */}
              <div>
                <label className="block text-white/40 text-xs font-mono mb-1.5">
                  Fotoğraflar ({editProject.photos.length + pendingFiles.length})
                </label>

                {/* Mevcut fotoğraflar */}
                {(editProject.photos.length > 0 || pendingFiles.length > 0) && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {editProject.photos.map((url, i) => (
                      <div key={`existing-${i}`} className="relative aspect-square rounded-lg overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {pendingFiles.map((file, i) => (
                      <div key={`pending-${i}`} className="relative aspect-square rounded-lg overflow-hidden group border border-dashed border-gold-400/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gold-400/20 text-gold-400 text-[8px] font-mono text-center py-0.5">
                          Yeni
                        </div>
                        <button
                          onClick={() => removePendingFile(i)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/[0.08] rounded-xl p-6 text-center hover:border-white/[0.15] transition-colors"
                >
                  <Upload size={20} className="mx-auto text-white/20 mb-2" />
                  <p className="text-white/30 text-xs font-mono">Fotoğraf eklemek için tıklayın</p>
                  <p className="text-white/15 text-[10px] font-mono mt-1">JPG, PNG, WebP · Max 5MB</p>
                </button>
              </div>

              {/* Aktif */}
              <div className="flex items-center justify-between py-2">
                <span className="text-white/50 text-sm">Sitede Göster</span>
                <button
                  onClick={() => setEditProject({ ...editProject, active: !editProject.active })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    editProject.active ? 'bg-green-500' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      editProject.active ? 'translate-x-[22px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#111] flex gap-3 p-4 md:p-6 border-t border-white/[0.06]">
              <button
                onClick={() => !saving && setEditProject(null)}
                className="flex-1 py-3 rounded-full border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.04] transition-colors"
                disabled={saving}
              >
                İptal
              </button>
              <button
                onClick={saveProject}
                disabled={saving || !editProject.project_name.trim() || !editProject.city.trim()}
                className="flex-1 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-stone-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {uploading ? 'Yükleniyor...' : 'Kaydediliyor...'}
                  </>
                ) : (
                  isNew ? 'Ekle' : 'Kaydet'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
