'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, X, ExternalLink, Link2 } from 'lucide-react'

interface Project {
  id: string
  project_name: string
}

interface Referans {
  id: string
  name: string
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
  const [newProjectId, setNewProjectId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editProjectId, setEditProjectId] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState('')

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
        project_id: newProjectId || null,
        sort_order: referanslar.length + 1,
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Hata oluştu')
      return
    }
    setNewName('')
    setNewProjectId('')
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
        project_id: editProjectId || null,
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

  const startEdit = (ref: Referans) => {
    setEditingId(ref.id)
    setEditName(ref.name)
    setEditProjectId(ref.project_id || '')
  }

  if (loading) {
    return <div className="text-center py-20 text-white/30 font-mono text-sm">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-heading text-xl font-bold">Referanslar</h2>
          <p className="text-white/30 text-xs font-mono mt-1">Kayan referans bandında gösterilir</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Firma / Referans Adı"
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40"
            />
            <select
              value={newProjectId}
              onChange={(e) => setNewProjectId(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none appearance-none"
            >
              <option value="" className="bg-[#111]">Proje Bağla (opsiyonel)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-[#111]">{p.project_name}</option>
              ))}
            </select>
          </div>
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
        <div className="space-y-2">
          {referanslar.map((ref) => (
            <div
              key={ref.id}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between hover:border-white/[0.12] transition-colors"
            >
              {editingId === ref.id ? (
                <div className="flex-1 flex items-center gap-3">
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
                  <button
                    onClick={() => handleUpdate(ref.id)}
                    className="px-3 py-1.5 bg-white text-black rounded-lg text-xs font-medium hover:bg-stone-200"
                  >
                    Kaydet
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-white/30 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-gold-400/40" />
                    <span className="text-white font-medium text-sm">{ref.name}</span>
                    {ref.project && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-400/10 text-gold-400 text-[10px] font-mono">
                        <Link2 size={10} />
                        {ref.project.project_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {ref.project_id && (
                      <a
                        href={`/uygulamalarimiz/${ref.project_id}`}
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
                </>
              )}
            </div>
          ))}
        </div>
      )}

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
