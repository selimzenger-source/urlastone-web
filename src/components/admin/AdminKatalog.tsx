'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, Trash2, Check, ExternalLink, Download } from 'lucide-react'

interface CatalogInfo {
  url: string | null
  fileName: string | null
  size?: number
  updatedAt?: string
}

export default function AdminKatalog() {
  const [catalog, setCatalog] = useState<CatalogInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const password = typeof window !== 'undefined' ? localStorage.getItem('admin_pw') || '' : ''

  const fetchCatalog = async () => {
    setLoading(true)
    const res = await fetch('/api/katalog')
    const data = await res.json()
    setCatalog(data)
    setLoading(false)
  }

  useEffect(() => { fetchCatalog() }, [])

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Sadece PDF dosyası yükleyebilirsiniz')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/katalog/upload', {
      method: 'POST',
      headers: { 'x-admin-password': password },
      body: formData,
    })

    if (res.ok) {
      showSuccess('Katalog yüklendi')
    } else {
      const data = await res.json()
      alert(data.error || 'Yükleme başarısız')
    }
    setUploading(false)
    fetchCatalog()
  }

  const handleDelete = async () => {
    if (!confirm('Katalogu silmek istediğinize emin misiniz?')) return
    await fetch('/api/katalog', {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    })
    showSuccess('Katalog silindi')
    fetchCatalog()
  }

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${bytes} B`
  }

  if (loading) {
    return <div className="text-center py-20 text-white/30 font-mono text-sm">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/90 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-xl">
          <Check size={14} /> {successMsg}
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center">
            <FileText size={20} className="text-gold-400" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-white">Katalog Yönetimi</h3>
            <p className="text-white/30 text-xs font-mono">PDF katalog yükleyin, güncelleyin</p>
          </div>
        </div>

        {catalog?.url ? (
          <div className="space-y-4">
            {/* Current Catalog */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={28} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm truncate">{catalog.fileName}</h4>
                  <div className="flex items-center gap-3 mt-1 text-white/30 text-[10px] font-mono">
                    {catalog.size ? <span>{formatSize(catalog.size)}</span> : null}
                    {catalog.updatedAt && (
                      <span>Güncelleme: {new Date(catalog.updatedAt).toLocaleDateString('tr-TR')}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <a
                      href={catalog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-400/10 text-gold-400 rounded-lg text-xs font-mono hover:bg-gold-400/20 transition-colors"
                    >
                      <ExternalLink size={12} /> Görüntüle
                    </a>
                    <a
                      href={catalog.url}
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-400/10 text-blue-400 rounded-lg text-xs font-mono hover:bg-blue-400/20 transition-colors"
                    >
                      <Download size={12} /> İndir
                    </a>
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-mono hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={12} /> Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Update Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-white/[0.08] rounded-xl p-4 text-center hover:border-gold-400/30 transition-colors group"
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                  <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                  Yükleniyor...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-white/30 group-hover:text-gold-400 text-sm transition-colors">
                  <Upload size={16} /> Yeni Katalog Yükle (Güncelle)
                </div>
              )}
            </button>
          </div>
        ) : (
          /* No Catalog - Upload */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/[0.08] rounded-xl p-12 text-center cursor-pointer hover:border-gold-400/30 transition-colors group"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/40 text-sm">Yükleniyor...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gold-400/10 flex items-center justify-center group-hover:bg-gold-400/20 transition-colors">
                  <Upload size={28} className="text-gold-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">PDF Katalog Yükleyin</p>
                  <p className="text-white/30 text-xs font-mono mt-1">Sadece PDF · Max 50MB</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
