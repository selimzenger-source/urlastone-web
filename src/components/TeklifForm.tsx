'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Upload, X, CheckCircle, Loader2, ChevronDown, Check } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { turkishCities, cityDistricts } from '@/lib/turkey-cities'
import { useSearchParams } from 'next/navigation'

interface FormData {
  adSoyad: string
  telefon: string
  email: string
  ulke: string
  il: string
  ilce: string
  projeTipi: string
  metrekare: string
  aciklama: string
  kaynak: string
}

interface StoneType {
  id: string
  name: string
  code: string
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
  stone_type: StoneType
  category: Category
}

export default function TeklifForm() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const preselectedCode = searchParams.get('product')

  const projeTipleri = [
    t.form_opt_cephe, t.form_opt_zemin, t.form_opt_ic_mekan,
    t.form_opt_bahce, t.form_opt_havuz, t.form_opt_merdiven, t.form_opt_diger,
  ]
  const metrekareSecenekleri = ['0 – 50 m\u00B2', '50 – 100 m\u00B2', '100 – 500 m\u00B2', '500+ m\u00B2', t.form_sqm_unknown]
  const kaynakSecenekleri = [t.form_source_google, t.form_source_instagram, t.form_source_referral, t.form_source_other]

  const [form, setForm] = useState<FormData>({
    adSoyad: '', telefon: '', email: '', ulke: 'Türkiye',
    il: '', ilce: '', projeTipi: '', metrekare: '', aciklama: '', kaynak: '',
  })

  const [dosyalar, setDosyalar] = useState<File[]>([])
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [basarili, setBasarili] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // City autocomplete
  const [cityQuery, setCityQuery] = useState('')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const cityRef = useRef<HTMLDivElement>(null)

  // 3-step product selection
  const [stoneTypes, setStoneTypes] = useState<StoneType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [bilmiyorum, setBilmiyorum] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const isTurkiye = form.ulke === 'Türkiye'

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch('/api/stone-types').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([types, cats, prods]) => {
      if (Array.isArray(types)) setStoneTypes(types)
      if (Array.isArray(cats)) setCategories(cats)
      if (Array.isArray(prods)) {
        setProducts(prods)
        if (preselectedCode) {
          const found = prods.find((p: Product) => p.code === preselectedCode)
          if (found) {
            setSelectedProducts([found])
            setFilterType(found.stone_type?.code || null)
            setFilterCategory(found.category?.slug || null)
            setShowPicker(true)
          }
        }
      }
    })
  }, [preselectedCode])

  // Filter products
  const filteredProducts = products.filter(p => {
    if (filterType && p.stone_type?.code !== filterType) return false
    if (filterCategory && p.category?.slug !== filterCategory) return false
    return true
  })

  // City helpers
  const filteredCities = cityQuery.length > 0
    ? turkishCities.filter(c => c.toLowerCase().startsWith(cityQuery.toLowerCase()))
    : turkishCities
  const availableDistricts = isTurkiye && form.il ? (cityDistricts[form.il] || []) : []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCitySuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Baş harfleri büyük yap
  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, (c) => c.toLocaleUpperCase('tr-TR'))

  // Email format kontrolü
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let newValue = value

    // Ad Soyad: baş harfler büyük
    if (name === 'adSoyad') {
      newValue = capitalizeWords(value)
    }

    setForm(prev => ({ ...prev, [name]: newValue }))
    // Hata mesajını temizle
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, ulke: e.target.value, il: '', ilce: '' }))
    setCityQuery('')
  }
  const selectCity = (city: string) => {
    setForm(prev => ({ ...prev, il: city, ilce: '' }))
    setCityQuery(city)
    setShowCitySuggestions(false)
  }

  const toggleProduct = (product: Product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id)
      if (exists) return prev.filter(p => p.id !== product.id)
      if (prev.length >= 4) return prev
      // Auto-close picker after selecting
      setTimeout(() => setShowPicker(false), 150)
      return [...prev, product]
    })
    setBilmiyorum(false)
  }
  const handleBilmiyorum = () => {
    setBilmiyorum(!bilmiyorum)
    if (!bilmiyorum) setSelectedProducts([])
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Ad Soyad: min 3 karakter
    if (form.adSoyad.trim().length < 3) {
      newErrors.adSoyad = 'Ad Soyad en az 3 karakter olmalıdır'
    }

    // Telefon: min 7 karakter (uluslararası numaralar için)
    const cleanPhone = form.telefon.replace(/[\s\-\(\)]/g, '')
    if (cleanPhone.length < 7) {
      newErrors.telefon = 'Geçerli bir telefon numarası giriniz'
    }

    // Email: format kontrolü (opsiyonel ama girilmişse geçerli olmalı)
    if (form.email && !isValidEmail(form.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setGonderiliyor(true)
    const tasTermihi = bilmiyorum
      ? [t.form_stone_recommend]
      : selectedProducts.map(p => `${p.name} (${p.code})`)
    try {
      const res = await fetch('/api/teklifler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_soyad: form.adSoyad, telefon: form.telefon, email: form.email,
          ulke: form.ulke, il: form.il, ilce: form.ilce,
          proje_tipi: form.projeTipi, tas_tercihi: tasTermihi,
          metrekare: form.metrekare, aciklama: form.aciklama, kaynak: form.kaynak,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setBasarili(true)
    } catch {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
    setGonderiliyor(false)
  }

  if (basarili) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-white mb-3">{t.form_success_title}</h3>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-2">{t.form_success_desc}</p>
        <p className="text-white/30 text-xs font-mono">{t.form_success_time}</p>
      </div>
    )
  }

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors"

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10">
      <div className="mb-8">
        <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-2">{t.form_free_quote}</p>
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
            <input type="text" name="adSoyad" required value={form.adSoyad} onChange={handleChange}
              minLength={3} placeholder={t.form_name_placeholder}
              className={`${inputClass} ${errors.adSoyad ? 'border-red-500/50' : ''}`} />
            {errors.adSoyad && <p className="text-red-400 text-[10px] font-mono mt-1">{errors.adSoyad}</p>}
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              {t.form_phone_label} <span className="text-gold-400">*</span>
            </label>
            <input type="tel" name="telefon" required value={form.telefon} onChange={handleChange}
              placeholder={t.form_phone_placeholder}
              className={`${inputClass} ${errors.telefon ? 'border-red-500/50' : ''}`} />
            {errors.telefon && <p className="text-red-400 text-[10px] font-mono mt-1">{errors.telefon}</p>}
          </div>
        </div>

        <div>
          <label className="block text-white/50 text-xs font-mono mb-2">{t.form_email_label}</label>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            placeholder={t.form_email_placeholder}
            className={`${inputClass} ${errors.email ? 'border-red-500/50' : ''}`} />
          {errors.email && <p className="text-red-400 text-[10px] font-mono mt-1">{errors.email}</p>}
        </div>

        {/* Ülke */}
        <div>
          <label className="block text-white/50 text-xs font-mono mb-2">
            {t.form_country_label} <span className="text-gold-400">*</span>
          </label>
          <input type="text" name="ulke" required value={form.ulke} onChange={handleCountryChange} className={inputClass} />
        </div>

        {/* İl / İlçe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div ref={cityRef} className="relative">
            <label className="block text-white/50 text-xs font-mono mb-2">
              {t.form_city_label} <span className="text-gold-400">*</span>
            </label>
            {isTurkiye ? (
              <>
                <div className="relative">
                  <input type="text" value={cityQuery}
                    onChange={(e) => { setCityQuery(e.target.value); setShowCitySuggestions(true); if (form.il && e.target.value !== form.il) setForm(prev => ({ ...prev, il: '', ilce: '' })) }}
                    onFocus={() => setShowCitySuggestions(true)} placeholder={t.form_city_placeholder}
                    className={inputClass} required={!form.il} />
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                </div>
                {showCitySuggestions && filteredCities.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto rounded-xl bg-[#1a1a1a] border border-white/[0.12] shadow-2xl">
                    {filteredCities.map(city => (
                      <button key={city} type="button" onClick={() => selectCity(city)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${form.il === city ? 'bg-gold-400/20 text-gold-400' : 'text-white/70 hover:bg-white/[0.06]'}`}>
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <input type="text" name="il" value={form.il} onChange={handleChange} placeholder={t.form_city_placeholder} className={inputClass} />
            )}
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">{t.form_district_label}</label>
            {isTurkiye && form.il && availableDistricts.length > 0 ? (
              <select value={form.ilce} onChange={(e) => setForm(prev => ({ ...prev, ilce: e.target.value }))}
                className={`${inputClass} appearance-none cursor-pointer`}>
                <option value="" className="bg-[#1a1a1a]">{t.form_district_placeholder}</option>
                {availableDistricts.map(d => <option key={d} value={d} className="bg-[#1a1a1a]">{d}</option>)}
              </select>
            ) : (
              <input type="text" value={isTurkiye ? '' : form.ilce}
                onChange={(e) => setForm(prev => ({ ...prev, ilce: e.target.value }))}
                placeholder={isTurkiye ? (form.il ? t.form_district_placeholder : 'Önce il seçin') : t.form_district_placeholder}
                disabled={isTurkiye && !form.il}
                className={`${inputClass} ${isTurkiye && !form.il ? 'opacity-40 cursor-not-allowed' : ''}`} />
            )}
          </div>
        </div>

        {/* Proje Detayları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              {t.form_project_type_label} <span className="text-gold-400">*</span>
            </label>
            <select name="projeTipi" required value={form.projeTipi} onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}>
              <option value="" className="bg-[#1a1a1a]">{t.form_select_placeholder}</option>
              {projeTipleri.map(tip => <option key={tip} value={tip} className="bg-[#1a1a1a]">{tip}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">{t.form_sqm_label}</label>
            <select name="metrekare" value={form.metrekare} onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}>
              <option value="" className="bg-[#1a1a1a]">{t.form_select_placeholder}</option>
              {metrekareSecenekleri.map(m => <option key={m} value={m} className="bg-[#1a1a1a]">{m}</option>)}
            </select>
          </div>
        </div>

        {/* ═══ 3-STEP TAŞ SEÇİMİ ═══ */}
        <div>
          <label className="block text-white/50 text-xs font-mono mb-3">
            {t.form_stone_pref_label} <span className="text-white/30">(max 4 ürün)</span>
          </label>

          {/* Selected products chips */}
          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedProducts.map(p => (
                <span key={p.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-400/15 text-gold-400 text-xs font-mono border border-gold-400/20">
                  {p.name} · {p.code}
                  <button type="button" onClick={() => toggleProduct(p)} className="hover:text-white"><X size={12} /></button>
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button type="button" onClick={handleBilmiyorum}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${
                bilmiyorum ? 'bg-gold-400/20 border-gold-400/40 text-gold-300' : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:border-white/20'
              }`}>
              {t.form_stone_recommend}
            </button>
            {!bilmiyorum && (
              <button type="button" onClick={() => setShowPicker(!showPicker)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${
                  showPicker ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:border-white/20'
                }`}>
                {showPicker ? 'Kapat' : selectedProducts.length > 0 ? `+ Başka ürün ekle (${selectedProducts.length}/4)` : 'Ürün seç...'}
              </button>
            )}
          </div>

          {/* 3-Step Product Picker */}
          {showPicker && !bilmiyorum && (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">

              {/* Step 1: Ebat Kategorisi */}
              <div className="p-3 border-b border-white/[0.06]">
                <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-2">1. Ebat Kategorisi</p>
                <div className="flex gap-1.5 overflow-x-auto">
                  <button type="button" onClick={() => setFilterCategory(null)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap transition-colors ${
                      !filterCategory ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                    }`}>Tümü</button>
                  {categories.map(cat => (
                    <button key={cat.id} type="button" onClick={() => setFilterCategory(filterCategory === cat.slug ? null : cat.slug)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap transition-colors ${
                        filterCategory === cat.slug ? 'bg-gold-400/20 text-gold-400' : 'text-white/40 hover:text-white/60'
                      }`}>{cat.name}</button>
                  ))}
                </div>
              </div>

              {/* Step 2: Taş Türü */}
              <div className="p-3 border-b border-white/[0.06]">
                <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-2">2. Taş Türü</p>
                <div className="flex gap-1.5 overflow-x-auto">
                  <button type="button" onClick={() => setFilterType(null)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap transition-colors ${
                      !filterType ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                    }`}>Tümü</button>
                  {stoneTypes.map(st => (
                    <button key={st.id} type="button" onClick={() => setFilterType(filterType === st.code ? null : st.code)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap transition-colors ${
                        filterType === st.code ? 'bg-gold-400/20 text-gold-400' : 'text-white/40 hover:text-white/60'
                      }`}>{st.name}</button>
                  ))}
                </div>
              </div>

              {/* Step 3: Ürün Seçimi */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">3. Ürün Seç</p>
                  <p className="text-white/20 text-[10px] font-mono">{filteredProducts.length} ürün</p>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="text-white/20 text-xs font-mono text-center py-6">Bu filtrede ürün yok</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {filteredProducts.map(product => {
                        const isSelected = selectedProducts.some(p => p.id === product.id)
                        const isDisabled = !isSelected && selectedProducts.length >= 4
                        return (
                          <button key={product.id} type="button"
                            onClick={() => !isDisabled && toggleProduct(product)}
                            disabled={isDisabled}
                            className={`relative rounded-xl p-2 text-center transition-all duration-200 border ${
                              isSelected ? 'border-gold-400/40 bg-gold-400/10'
                              : isDisabled ? 'border-white/[0.04] bg-white/[0.01] opacity-40 cursor-not-allowed'
                              : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                            }`}>
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center z-10">
                                <Check size={10} className="text-black" />
                              </div>
                            )}
                            <div className="aspect-square rounded-lg bg-white/[0.04] mb-1.5 overflow-hidden flex items-center justify-center">
                              {product.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white/10 font-heading text-lg font-bold">{product.name.charAt(0)}</span>
                              )}
                            </div>
                            <p className="text-white text-[11px] font-medium truncate">{product.name}</p>
                            <p className="text-white/30 text-[9px] font-mono">{product.code}</p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                {selectedProducts.length >= 4 && (
                  <p className="text-gold-400/60 text-[10px] font-mono text-center mt-2">Maksimum 4 ürün seçilebilir</p>
                )}
              </div>
            </div>
          )}
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
                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                  <button type="button" onClick={() => removeFile(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-white/50 text-xs font-mono mb-2">{t.form_notes_label}</label>
          <textarea name="aciklama" value={form.aciklama} onChange={handleChange} rows={4}
            placeholder={t.form_notes_placeholder} className={`${inputClass} resize-none`} />
        </div>

        {/* Bizi Nereden Buldunuz */}
        <div>
          <label className="block text-white/50 text-xs font-mono mb-2">{t.form_source_label}</label>
          <select name="kaynak" value={form.kaynak} onChange={handleChange}
            className={`${inputClass} appearance-none cursor-pointer`}>
            <option value="" className="bg-[#1a1a1a]">{t.form_select_placeholder}</option>
            {kaynakSecenekleri.map(k => <option key={k} value={k} className="bg-[#1a1a1a]">{k}</option>)}
          </select>
        </div>

        {/* Submit */}
        <button type="submit" disabled={gonderiliyor}
          className="w-full bg-white text-black py-4 rounded-full font-medium text-sm hover:bg-stone-200 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
          {gonderiliyor ? (<><Loader2 size={16} className="animate-spin" />{t.form_submitting}</>) : (<><Send size={16} />{t.form_submit_btn}</>)}
        </button>

        <p className="text-white/20 text-[10px] font-mono text-center">{t.form_privacy_note}</p>
      </div>
    </form>
  )
}
