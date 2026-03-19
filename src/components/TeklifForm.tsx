'use client'

import { useState } from 'react'
import { Send, Upload, X, CheckCircle, Loader2 } from 'lucide-react'

const projeTipleri = [
  'Cephe Kaplama',
  'Zemin Döşeme',
  'İç Mekan',
  'Bahçe & Peyzaj',
  'Havuz Kenarı',
  'Merdiven & Basamak',
  'Diğer',
]

const tasSecenekleri = [
  'Traverten',
  'Mermer',
  'Bazalt',
  'Granit',
  'Lime Stone',
  'Onyx',
  'Bilmiyorum, önerinizi isterim',
]

const metrekareSecenekleri = [
  '0 – 50 m²',
  '50 – 100 m²',
  '100 – 500 m²',
  '500+ m²',
  'Bilmiyorum',
]

const kaynakSecenekleri = [
  'Google',
  'Instagram',
  'Tavsiye',
  'Diğer',
]

interface FormData {
  adSoyad: string
  telefon: string
  email: string
  il: string
  ilce: string
  projeTipi: string
  tasTermihi: string[]
  metrekare: string
  aciklama: string
  kaynak: string
}

export default function TeklifForm() {
  const [form, setForm] = useState<FormData>({
    adSoyad: '',
    telefon: '',
    email: '',
    il: '',
    ilce: '',
    projeTipi: '',
    tasTermihi: [],
    metrekare: '',
    aciklama: '',
    kaynak: '',
  })

  const [dosyalar, setDosyalar] = useState<File[]>([])
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [basarili, setBasarili] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleTasToggle = (tas: string) => {
    setForm(prev => {
      const selected = prev.tasTermihi.includes(tas)
        ? prev.tasTermihi.filter(t => t !== tas)
        : [...prev.tasTermihi, tas]
      return { ...prev, tasTermihi: selected }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - dosyalar.length)
      setDosyalar(prev => [...prev, ...newFiles].slice(0, 5))
    }
  }

  const removeFile = (index: number) => {
    setDosyalar(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGonderiliyor(true)

    // TODO: API endpoint'e gönderim (Resend / Next.js API route)
    await new Promise(resolve => setTimeout(resolve, 1500))

    setBasarili(true)
    setGonderiliyor(false)
  }

  if (basarili) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-white mb-3">
          Talebiniz Alındı!
        </h3>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-2">
          En kısa sürede sizinle iletişime geçeceğiz. Detaylı teklifiniz e-posta adresinize gönderilecektir.
        </p>
        <p className="text-white/30 text-xs font-mono">
          Ortalama yanıt süresi: 24 saat içinde
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10">
      <div className="mb-8">
        <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-2">
          Ücretsiz Teklif
        </p>
        <h3 className="font-heading text-2xl font-bold text-white">
          Projenizi anlatın, <span className="italic text-gradient-gold">biz teklif verelim.</span>
        </h3>
      </div>

      <div className="space-y-6">
        {/* Kişisel Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              Ad Soyad <span className="text-gold-400">*</span>
            </label>
            <input
              type="text"
              name="adSoyad"
              required
              value={form.adSoyad}
              onChange={handleChange}
              placeholder="Adınız Soyadınız"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              Telefon <span className="text-gold-400">*</span>
            </label>
            <input
              type="tel"
              name="telefon"
              required
              value={form.telefon}
              onChange={handleChange}
              placeholder="05XX XXX XX XX"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-white/50 text-xs font-mono mb-2">
            E-posta
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="ornek@mail.com"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors"
          />
        </div>

        {/* Konum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              İl <span className="text-gold-400">*</span>
            </label>
            <input
              type="text"
              name="il"
              required
              value={form.il}
              onChange={handleChange}
              placeholder="Örn: İzmir"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              İlçe
            </label>
            <input
              type="text"
              name="ilce"
              value={form.ilce}
              onChange={handleChange}
              placeholder="Örn: Urla"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors"
            />
          </div>
        </div>

        {/* Proje Detayları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              Proje Tipi <span className="text-gold-400">*</span>
            </label>
            <select
              name="projeTipi"
              required
              value={form.projeTipi}
              onChange={handleChange}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-400/40 transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1a1a1a]">Seçiniz...</option>
              {projeTipleri.map(tip => (
                <option key={tip} value={tip} className="bg-[#1a1a1a]">{tip}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              Tahmini Metrekare
            </label>
            <select
              name="metrekare"
              value={form.metrekare}
              onChange={handleChange}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-400/40 transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1a1a1a]">Seçiniz...</option>
              {metrekareSecenekleri.map(m => (
                <option key={m} value={m} className="bg-[#1a1a1a]">{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Taş Tercihi - Chip Select */}
        <div>
          <label className="block text-white/50 text-xs font-mono mb-3">
            Taş Tercihi <span className="text-white/30">(birden fazla seçebilirsiniz)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {tasSecenekleri.map(tas => {
              const selected = form.tasTermihi.includes(tas)
              return (
                <button
                  key={tas}
                  type="button"
                  onClick={() => handleTasToggle(tas)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${
                    selected
                      ? 'bg-gold-400/20 border-gold-400/40 text-gold-300'
                      : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:border-white/20'
                  }`}
                >
                  {tas}
                </button>
              )
            })}
          </div>
        </div>

        {/* Fotoğraf Yükleme */}
        <div>
          <label className="block text-white/50 text-xs font-mono mb-3">
            Uygulama Alanı Fotoğrafları <span className="text-white/30">(max 5 adet)</span>
          </label>

          {dosyalar.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {dosyalar.map((file, i) => (
                <div key={i} className="relative group">
                  <div className="w-20 h-20 rounded-lg bg-white/[0.06] border border-white/[0.08] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {dosyalar.length < 5 && (
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/[0.12] cursor-pointer hover:border-gold-400/30 transition-colors">
              <Upload size={18} className="text-white/30" />
              <span className="text-white/40 text-sm">Fotoğraf ekle (JPG, PNG — max 10MB)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-white/50 text-xs font-mono mb-2">
            Ek Açıklama / Özel İstekler
          </label>
          <textarea
            name="aciklama"
            value={form.aciklama}
            onChange={handleChange}
            rows={4}
            placeholder="Projeniz hakkında eklemek istediğiniz detaylar..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors resize-none"
          />
        </div>

        {/* Bizi Nereden Buldunuz */}
        <div>
          <label className="block text-white/50 text-xs font-mono mb-2">
            Bizi nereden buldunuz?
          </label>
          <select
            name="kaynak"
            value={form.kaynak}
            onChange={handleChange}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-400/40 transition-colors appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#1a1a1a]">Seçiniz...</option>
            {kaynakSecenekleri.map(k => (
              <option key={k} value={k} className="bg-[#1a1a1a]">{k}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={gonderiliyor}
          className="w-full bg-white text-black py-4 rounded-full font-medium text-sm hover:bg-stone-200 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {gonderiliyor ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Gönderiliyor...
            </>
          ) : (
            <>
              <Send size={16} />
              Teklif Talebi Gönder
            </>
          )}
        </button>

        <p className="text-white/20 text-[10px] font-mono text-center">
          Bilgileriniz gizli tutulur ve yalnızca teklif sürecinde kullanılır.
        </p>
      </div>
    </form>
  )
}
