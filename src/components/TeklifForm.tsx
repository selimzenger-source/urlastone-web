'use client'

import { useState } from 'react'
import { Send, Upload, X, CheckCircle, Loader2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

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
  const { t } = useLanguage()

  const projeTipleri = [
    t.form_opt_cephe,
    t.form_opt_zemin,
    t.form_opt_ic_mekan,
    t.form_opt_bahce,
    t.form_opt_havuz,
    t.form_opt_merdiven,
    t.form_opt_diger,
  ]

  const tasSecenekleri = [
    t.form_stone_traverten,
    t.form_stone_mermer,
    t.form_stone_bazalt,
    t.form_stone_granit,
    t.form_stone_limestone,
    t.form_stone_onyx,
    t.form_stone_recommend,
  ]

  const metrekareSecenekleri = [
    '0 – 50 m\u00B2',
    '50 – 100 m\u00B2',
    '100 – 500 m\u00B2',
    '500+ m\u00B2',
    t.form_sqm_unknown,
  ]

  const kaynakSecenekleri = [
    t.form_source_google,
    t.form_source_instagram,
    t.form_source_referral,
    t.form_source_other,
  ]

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
          {t.form_success_title}
        </h3>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-2">
          {t.form_success_desc}
        </p>
        <p className="text-white/30 text-xs font-mono">
          {t.form_success_time}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10">
      <div className="mb-8">
        <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-2">
          {t.form_free_quote}
        </p>
        <h3 className="font-heading text-2xl font-bold text-white">
          {t.form_title} <span className="text-gradient-gold">{t.form_title_gold}</span>
        </h3>
      </div>

      <div className="space-y-6">
        {/* Kişisel Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              {t.form_name_label} <span className="text-gold-400">*</span>
            </label>
            <input
              type="text"
              name="adSoyad"
              required
              value={form.adSoyad}
              onChange={handleChange}
              placeholder={t.form_name_placeholder}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              {t.form_phone_label} <span className="text-gold-400">*</span>
            </label>
            <input
              type="tel"
              name="telefon"
              required
              value={form.telefon}
              onChange={handleChange}
              placeholder={t.form_phone_placeholder}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-white/50 text-xs font-mono mb-2">
            {t.form_email_label}
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t.form_email_placeholder}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors"
          />
        </div>

        {/* Konum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              {t.form_city_label} <span className="text-gold-400">*</span>
            </label>
            <input
              type="text"
              name="il"
              required
              value={form.il}
              onChange={handleChange}
              placeholder={t.form_city_placeholder}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              {t.form_district_label}
            </label>
            <input
              type="text"
              name="ilce"
              value={form.ilce}
              onChange={handleChange}
              placeholder={t.form_district_placeholder}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors"
            />
          </div>
        </div>

        {/* Proje Detayları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              {t.form_project_type_label} <span className="text-gold-400">*</span>
            </label>
            <select
              name="projeTipi"
              required
              value={form.projeTipi}
              onChange={handleChange}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-400/40 transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1a1a1a]">{t.form_select_placeholder}</option>
              {projeTipleri.map(tip => (
                <option key={tip} value={tip} className="bg-[#1a1a1a]">{tip}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              {t.form_sqm_label}
            </label>
            <select
              name="metrekare"
              value={form.metrekare}
              onChange={handleChange}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-400/40 transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1a1a1a]">{t.form_select_placeholder}</option>
              {metrekareSecenekleri.map(m => (
                <option key={m} value={m} className="bg-[#1a1a1a]">{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Taş Tercihi - Chip Select */}
        <div>
          <label className="block text-white/50 text-xs font-mono mb-3">
            {t.form_stone_pref_label} <span className="text-white/30">{t.form_stone_pref_hint}</span>
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
            {t.form_photos_label} <span className="text-white/30">{t.form_photos_hint}</span>
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
              <span className="text-white/40 text-sm">{t.form_photos_add}</span>
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
            {t.form_notes_label}
          </label>
          <textarea
            name="aciklama"
            value={form.aciklama}
            onChange={handleChange}
            rows={4}
            placeholder={t.form_notes_placeholder}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors resize-none"
          />
        </div>

        {/* Bizi Nereden Buldunuz */}
        <div>
          <label className="block text-white/50 text-xs font-mono mb-2">
            {t.form_source_label}
          </label>
          <select
            name="kaynak"
            value={form.kaynak}
            onChange={handleChange}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-400/40 transition-colors appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#1a1a1a]">{t.form_select_placeholder}</option>
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
              {t.form_submitting}
            </>
          ) : (
            <>
              <Send size={16} />
              {t.form_submit_btn}
            </>
          )}
        </button>

        <p className="text-white/20 text-[10px] font-mono text-center">
          {t.form_privacy_note}
        </p>
      </div>
    </form>
  )
}
