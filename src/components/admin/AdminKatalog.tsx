'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, Trash2, Check, ExternalLink, Download, AlertTriangle } from 'lucide-react'

interface CatalogInfo {
  url: string | null
  fileName: string | null
  size?: number
  updatedAt?: string
}

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

function formatSize(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

function CatalogCard({ brand, title, subtitle, accent }: { brand: 'urlastone' | 'urlaklinker'; title: string; subtitle: string; accent: string }) {
  const [catalog, setCatalog] = useState<CatalogInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const password = typeof window !== 'undefined' ? localStorage.getItem('admin_pw') || '' : ''

  const fetchCatalog = async () => {
    setLoading(true)
    const res = await fetch(`/api/katalog?brand=${brand}`)
    setCatalog(await res.json())
    setLoading(false)
  }
  useEffect(() => { fetchCatalog() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000) }

  const handleUpload = async (file: File) => {
    if (file.type !== 'application/pdf') { alert('Sadece PDF dosyası yükleyebilirsiniz'); return }
    if (file.size > MAX_FILE_SIZE) {
      alert(`Dosya çok büyük! Max 20MB.\nDosya: ${(file.size / 1024 / 1024).toFixed(1)} MB`); return
    }
    setUploading(true); setUploadProgress('İmzalı URL alınıyor...')
    try {
      const res = await fetch('/api/katalog/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ fileName: file.name, brand }),
      })
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Signed URL alınamadı'); setUploading(false); setUploadProgress(''); return }
      const { signedUrl } = await res.json()
      setUploadProgress('PDF yükleniyor...')
      const up = await fetch(signedUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf', 'x-upsert': 'true' }, body: file })
      if (up.ok) showSuccess('Katalog başarıyla yüklendi!')
      else { const t = await up.text(); alert(`Yükleme başarısız: ${t}`) }
    } catch (err) { alert('Yükleme sırasında hata oluştu'); console.error(err) }
    setUploading(false); setUploadProgress(''); fetchCatalog()
  }

  const handleDelete = async () => {
    if (!confirm(`${title} katalogunu silmek istediğinize emin misiniz?`)) return
    await fetch(`/api/katalog?brand=${brand}`, { method: 'DELETE', headers: { 'x-admin-password': password } })
    showSuccess('Katalog silindi'); fetchCatalog()
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-7">
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/90 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-xl">
          <Check size={14} /> {successMsg}
        </div>
      )}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}1a` }}>
          <FileText size={20} style={{ color: accent }} />
        </div>
        <div>
          <h3 className="font-heading text-base font-semibold text-white">{title}</h3>
          <p className="text-white/30 text-xs font-mono">{subtitle}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-white/30 font-mono text-xs">Yükleniyor...</div>
      ) : catalog?.url ? (
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <FileText size={24} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate">{catalog.fileName}</h4>
                <div className="flex items-center gap-3 mt-1 text-white/30 text-[10px] font-mono">
                  {catalog.size ? <span>{formatSize(catalog.size)}</span> : null}
                  {catalog.updatedAt && <span>Güncelleme: {new Date(catalog.updatedAt).toLocaleDateString('tr-TR')}</span>}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <a href={catalog.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-400/10 text-gold-400 rounded-lg text-xs font-mono hover:bg-gold-400/20 transition-colors"><ExternalLink size={12} /> Görüntüle</a>
                  <a href={catalog.url} download className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-400/10 text-blue-400 rounded-lg text-xs font-mono hover:bg-blue-400/20 transition-colors"><Download size={12} /> İndir</a>
                  <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-mono hover:bg-red-500/20 transition-colors"><Trash2 size={12} /> Sil</button>
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full border-2 border-dashed border-white/[0.08] rounded-xl p-3.5 text-center hover:border-gold-400/30 transition-colors group">
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-white/40 text-sm"><div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />{uploadProgress || 'Yükleniyor...'}</div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-white/30 group-hover:text-gold-400 text-sm transition-colors"><Upload size={16} /> Yeni PDF Yükle (Güncelle)</div>
            )}
          </button>
        </div>
      ) : (
        <div onClick={() => !uploading && fileInputRef.current?.click()} className="border-2 border-dashed border-white/[0.08] rounded-xl p-10 text-center cursor-pointer hover:border-gold-400/30 transition-colors group">
          {uploading ? (
            <div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /><p className="text-white/40 text-sm">{uploadProgress || 'Yükleniyor...'}</p></div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gold-400/10 flex items-center justify-center group-hover:bg-gold-400/20 transition-colors"><Upload size={26} className="text-gold-400" /></div>
              <div><p className="text-white text-sm font-medium">PDF Katalog Yükleyin</p><p className="text-white/30 text-xs font-mono mt-1">Sadece PDF · Max 20MB</p></div>
            </div>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }} />
    </div>
  )
}

export default function AdminKatalog() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center"><FileText size={20} className="text-gold-400" /></div>
        <div>
          <h3 className="font-heading text-lg font-semibold text-white">Katalog Yönetimi</h3>
          <p className="text-white/30 text-xs font-mono">İki marka için ayrı PDF kataloglar — Supabase&apos;de saklanır</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <CatalogCard brand="urlastone" title="URLA STONE Katalog" subtitle="Doğal taş kataloğu · urlastone.com/katalog" accent="#b39345" />
        <CatalogCard brand="urlaklinker" title="URLAKLINKER Katalog" subtitle="Klinker kataloğu · urlaklinker.com/katalog" accent="#d2613a" />
      </div>

      <div className="space-y-2 text-white/20 text-[10px] font-mono">
        <div className="flex items-start gap-2"><AlertTriangle size={12} className="mt-0.5 flex-shrink-0" /><span>Maksimum 20MB. Her marka kendi sabit dosyasıyla saklanır; biri diğerini etkilemez.</span></div>
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 space-y-1">
          <p className="text-white/30 font-medium">PDF 20MB&apos;dan büyükse:</p>
          <p>1. <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline">ilovepdf.com/compress_pdf</a> → sürükle bırak → &quot;Extreme Compression&quot; → indir → buraya yükle</p>
        </div>
      </div>
    </div>
  )
}
