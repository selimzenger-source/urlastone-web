'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Save, X, ExternalLink, Link2, Upload, Image, Search, Loader2 } from 'lucide-react'
import { generateSlug } from '@/lib/slug'

interface Project {
  id: string
  project_name: string
  contractor?: string | null
  city?: string | null
}

interface Referans {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  project_id: string | null
  sort_order: number
  is_active: boolean
  project?: { id: string; project_name: string } | null
}

export default function AdminReferanslar() {
  const [referanslar, setReferanslar] = useState<Referans[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newProjectId, setNewProjectId] = useState('')
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editProjectId, setEditProjectId] = useState('')
  const [editWebsiteUrl, setEditWebsiteUrl] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)
  const [researching, setResearching] = useState(false)
  const [researchLogo, setResearchLogo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null)

  const password = typeof window !== 'undefined' ? localStorage.getItem('admin_pw') || '' : ''

  const fetchData = async () => {
    setLoading(true)
    const [refsRes, projsRes] = await Promise.all([
      fetch('/api/referanslar'),
      fetch('/api/projects'),
    ])
    const refs = await refsRes.json()
    const projs = await projsRes.json()
    if (Array.isArray(refs)) setReferanslar(refs)
    if (Array.isArray(projs)) setProjects(projs)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) {
      setError('Referans adı zorunludur')
      return
    }
    setError('')
    const res = await fetch('/api/referanslar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({
        name: newName.trim(),
        description: newDescription.trim() || null,
        project_id: newProjectId || null,
        website_url: newWebsiteUrl.trim() || null,
        sort_order: referanslar.length + 1,
      }),
    })
    const resData = await res.json()
    if (!res.ok) {
      setError(resData.error || 'Hata oluştu')
      return
    }
    // AI logosu bulunduysa otomatik yükle
    if (researchLogo && resData?.id) {
      try {
        const logoRes = await fetch(researchLogo)
        if (logoRes.ok) {
          const blob = await logoRes.blob()
          const file = new File([blob], 'logo.png', { type: blob.type || 'image/png' })
          await handleLogoUpload(resData.id, file)
        }
      } catch { /* logo upload opsiyonel */ }
    }
    setNewName('')
    setNewDescription('')
    setNewProjectId('')
    setNewWebsiteUrl('')
    setResearchLogo(null)
    setShowForm(false)
    fetchData()
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    await fetch(`/api/referanslar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({
        name: editName.trim(),
        description: editDescription.trim() || null,
        project_id: editProjectId || null,
        website_url: editWebsiteUrl.trim() || null,
      }),
    })
    setEditingId(null)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/referanslar/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    })
    setDeleteConfirm(null)
    fetchData()
  }

  const handleLogoUpload = async (refId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyası yüklenebilir')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo max 2MB olmalıdır')
      return
    }
    setUploading(refId)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('ref_id', refId)

    const res = await fetch('/api/referanslar/upload', {
      method: 'POST',
      headers: { 'x-admin-password': password },
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Logo yüklenemedi')
    }
    setUploading(null)
    fetchData()
  }

  // Proje seçilince firma adını otomatik doldur
  const handleProjectSelect = (projectId: string) => {
    setNewProjectId(projectId)
    if (projectId) {
      const project = projects.find(p => p.id === projectId)
      if (project?.contractor) {
        setNewName(project.contractor)
        setNewDescription('')
        setResearchLogo(null)
      }
    }
  }

  // AI ile firma araştır
  const handleResearch = async () => {
    const name = newName.trim()
    if (!name) {
      setError('Önce firma adını girin')
      return
    }
    setResearching(true)
    setError('')
    setResearchLogo(null)
    try {
      // Seçili projenin şehrini bul
      const selectedProject = projects.find(p => p.id === newProjectId)
      const res = await fetch('/api/referanslar/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ companyName: name, city: selectedProject?.city || '', websiteUrl: newWebsiteUrl.trim() || '' }),
      })
      if (!res.ok) throw new Error('Araştırma başarısız')
      const data = await res.json()
      if (data.description && !data.description.toLowerCase().includes('bulunamadı')) {
        setNewDescription(data.description)
      } else if (data.description?.toLowerCase().includes('bulunamadı')) {
        setError('Firma hakkında bilgi bulunamadı')
      }
      if (data.logo_url) setResearchLogo(data.logo_url)
    } catch {
      setError('Araştırma sırasında hata oluştu')
    } finally {
      setResearching(false)
    }
  }

  const startEdit = (ref: Referans) => {
    setEditingId(ref.id)
    setEditName(ref.name)
    setEditDescription(ref.description || '')
    setEditProjectId(ref.project_id || '')
    setEditWebsiteUrl(ref.website_url || '')
  }

  if (loading) {
    return <div className="text-center py-20 text-white/30 font-mono text-sm">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && uploadTargetId) {
            handleLogoUpload(uploadTargetId, file)
          }
          e.target.value = ''
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-heading text-xl font-bold">Referanslar</h2>
          <p className="text-white/30 text-xs font-mono mt-1">Firma logosu, açıklama ve proje bağlantısı ile yönetin</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
        >
          <Plus size={16} /> Yeni Referans
        </button>
      </div>

      {/* New Referans Form */}
      {showForm && (
        <div className="bg-white/[0.03] border border-gold-400/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium text-sm">Yeni Referans Ekle</h3>
            <button onClick={() => { setShowForm(false); setError('') }}>
              <X size={16} className="text-white/40" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Firma / Referans Adı"
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40"
                />
                <button
                  onClick={handleResearch}
                  disabled={researching || !newName.trim()}
                  className="px-3 py-2.5 rounded-xl bg-gold-400/10 text-gold-400 text-xs font-medium hover:bg-gold-400/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                  title="AI ile firma bilgisi araştır"
                >
                  {researching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  {researching ? 'Araştırılıyor...' : 'AI Araştır'}
                </button>
              </div>
              <select
                value={newProjectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none appearance-none"
              >
                <option value="" className="bg-[#111]">Proje Bağla (opsiyonel)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#111]">{p.project_name}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={newWebsiteUrl}
              onChange={(e) => setNewWebsiteUrl(e.target.value)}
              placeholder="Web sitesi veya Instagram (opsiyonel) — ör: eryyapi.com veya instagram.com/eryyapi"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40"
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Firma hakkında kısa açıklama (opsiyonel)"
              rows={2}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 resize-none"
            />
            {/* AI bulunan logo preview */}
            {researchLogo && (
              <div className="flex items-center gap-3 p-3 bg-white/[0.04] border border-gold-400/20 rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={researchLogo} alt="Logo" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />
                <div className="flex-1">
                  <p className="text-white/50 text-[10px] font-mono">AI tarafından bulunan logo</p>
                  <p className="text-white/30 text-[9px] font-mono truncate">{researchLogo}</p>
                </div>
                <button
                  onClick={() => setResearchLogo(null)}
                  className="p-1 text-white/30 hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
          <p className="text-white/20 text-[10px] font-mono mt-2">
            {researchLogo ? 'Logo kayıt sonrası otomatik yüklenecek' : 'Logo, referans oluşturulduktan sonra yüklenebilir'}
          </p>
          {error && <p className="mt-3 text-red-400 text-xs">{error}</p>}
          <button
            onClick={handleCreate}
            className="mt-4 inline-flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-xs font-medium hover:bg-stone-200 transition-colors"
          >
            <Save size={12} /> Kaydet
          </button>
        </div>
      )}

      {/* Referans List */}
      {referanslar.length === 0 ? (
        <div className="text-center py-16 text-white/20 font-mono text-sm">
          Henüz referans eklenmemiş
        </div>
      ) : (
        <div className="space-y-3">
          {referanslar.map((ref) => (
            <div
              key={ref.id}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-colors"
            >
              {editingId === ref.id ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-gold-400/40"
                    />
                    <select
                      value={editProjectId}
                      onChange={(e) => setEditProjectId(e.target.value)}
                      className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none appearance-none"
                    >
                      <option value="" className="bg-[#111]">Proje yok</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id} className="bg-[#111]">{p.project_name}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={editWebsiteUrl}
                    onChange={(e) => setEditWebsiteUrl(e.target.value)}
                    placeholder="Web sitesi veya Instagram (opsiyonel)"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-gold-400/40"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Firma açıklaması"
                    rows={2}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-gold-400/40 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(ref.id)}
                      className="px-3 py-1.5 bg-white text-black rounded-lg text-xs font-medium hover:bg-stone-200"
                    >
                      Kaydet
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-white/30 hover:text-white px-3 py-1.5">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  {/* Logo thumbnail */}
                  <div
                    className="w-16 h-16 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer hover:border-gold-400/30 transition-colors relative group/logo"
                    onClick={() => {
                      setUploadTargetId(ref.id)
                      fileInputRef.current?.click()
                    }}
                  >
                    {uploading === ref.id ? (
                      <div className="w-5 h-5 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
                    ) : ref.logo_url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ref.logo_url} alt={ref.name} className="max-h-12 max-w-[90%] object-contain" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload size={14} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <Image size={16} className="text-white/15 mx-auto" />
                        <span className="text-[8px] text-white/20 font-mono mt-0.5 block">Logo</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{ref.name}</span>
                      {ref.project && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-400/10 text-gold-400 text-[10px] font-mono">
                          <Link2 size={10} />
                          {ref.project.project_name}
                        </span>
                      )}
                    </div>
                    {ref.website_url && (
                      <a href={ref.website_url.startsWith('http') ? ref.website_url : `https://${ref.website_url}`} target="_blank" rel="noopener noreferrer" className="text-gold-400/50 text-[10px] font-mono hover:text-gold-400 transition-colors">
                        {ref.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    )}
                    {ref.description && (
                      <p className="text-white/30 text-xs line-clamp-1">{ref.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ref.project_id && (
                      <a
                        href={`/projelerimiz/${ref.project?.project_name ? generateSlug(ref.project.project_name) : ref.project_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-white/20 hover:text-gold-400 hover:bg-white/[0.04] transition-colors"
                        title="Proje sayfasını aç"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      onClick={() => startEdit(ref)}
                      className="px-3 py-1 rounded-lg text-white/30 text-xs hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(ref.id)}
                      className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/[0.05] transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && !showForm && <p className="text-red-400 text-xs">{error}</p>}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-medium mb-2">Referansı Sil</h3>
            <p className="text-white/40 text-sm mb-6">
              &ldquo;{referanslar.find(r => r.id === deleteConfirm)?.name}&rdquo; silinecek. Emin misiniz?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] text-white/60 text-sm hover:bg-white/[0.1]"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30"
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
