'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Upload, X, CheckCircle, Loader2, ChevronDown, Check, Phone, Mail, MessageCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { languages } from '@/lib/i18n'
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
  cepheMetre: string
  disKoseUzunluk: string
  fiyatTipi: 'sadece_tas' | 'tas_ve_malzeme'
  aciklama: string
  kaynak: string
  iletisimTuru: string
  tercihDil: string
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
  const { t, locale } = useLanguage()
  const searchParams = useSearchParams()
  const preselectedCode = searchParams.get('product')

  const projeTipleri = [
    t.form_opt_cephe, t.form_opt_zemin, t.form_opt_ic_mekan,
    t.form_opt_bahce, t.form_opt_havuz, t.form_opt_merdiven, t.form_opt_diger,
  ]
  const kaynakSecenekleri = [t.form_source_google, t.form_source_instagram, t.form_source_referral, t.form_source_ai || 'Yapay Zeka Önerisi', t.form_source_other]

  const [form, setForm] = useState<FormData>({
    adSoyad: '', telefon: '', email: '', ulke: 'Türkiye',
    il: '', ilce: '', projeTipi: '', cepheMetre: '', disKoseUzunluk: '',
    fiyatTipi: 'sadece_tas', aciklama: '', kaynak: '',
    iletisimTuru: 'phone', tercihDil: locale,
  })

  const [dosyalar, setDosyalar] = useState<File[]>([])
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [basarili, setBasarili] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [simulationResult, setSimulationResult] = useState<{ resultUrl?: string; originalUrl?: string; stoneName?: string } | null>(null)

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
  const [phoneCode, setPhoneCode] = useState('+90')

  const isTurkiye = form.ulke === 'Türkiye'

  // Sync language preference with site locale
  useEffect(() => {
    setForm(prev => ({ ...prev, tercihDil: locale }))
  }, [locale])

  // Load simulation data from sessionStorage (when coming from /simulasyon)
  useEffect(() => {
    try {
      const data = sessionStorage.getItem('simulationData')
      if (data) {
        const parsed = JSON.parse(data)
        setSimulationResult(parsed)
        if (parsed.stoneName) {
          setForm(prev => ({
            ...prev,
            aciklama: prev.aciklama || `AI Simülasyon sonucu: ${parsed.stoneName} taşı ile ilgileniyorum.`,
          }))
        }
        sessionStorage.removeItem('simulationData')
      }
    } catch { /* ignore */ }
  }, [])

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

  // Baş harfleri büyük, geri kalanı küçük yap (Ersin Gökçen formatı)
  const capitalizeWords = (str: string) =>
    str.toLocaleLowerCase('tr-TR').replace(/(?:^|\s)\S/g, (c) => c.toLocaleUpperCase('tr-TR'))

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
  const countryPhoneCodes: Record<string, string> = {
    'Türkiye': '+90', 'Deutschland': '+49', 'España': '+34', 'France': '+33',
    'Россия': '+7', 'United Kingdom': '+44', 'United States': '+1',
  }
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const country = e.target.value
    setForm(prev => ({ ...prev, ulke: country, il: '', ilce: '' }))
    setCityQuery('')
    if (countryPhoneCodes[country]) setPhoneCode(countryPhoneCodes[country])
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

    // Telefon: Türkiye ise 5XX format (10 hane, ülke kodu hariç), diğer ülkeler min 7 hane
    const cleanPhone = form.telefon.replace(/[\s\-\(\)+]/g, '')
    if (form.ulke === 'Türkiye') {
      if (!/^5\d{9}$/.test(cleanPhone)) {
        newErrors.telefon = 'Telefon numaranızı 5XX XXX XX XX formatında girin (10 hane)'
      }
    } else if (cleanPhone.length < 7) {
      newErrors.telefon = 'Geçerli bir telefon numarası giriniz'
    }

    // Email: her zaman zorunlu + format kontrol
    if (!form.email) {
      newErrors.email = t.form_email_required || 'E-posta adresi zorunludur'
    } else if (!isValidEmail(form.email)) {
      newErrors.email = 'E-posta adresinizi ornek@gmail.com formatında giriniz'
    }

    // Metrekare: zorunlu, 0'dan büyük tam sayı
    const m2 = parseInt(form.cepheMetre)
    if (!form.cepheMetre || isNaN(m2) || m2 < 1 || !Number.isInteger(Number(form.cepheMetre))) {
      newErrors.cepheMetre = 'Lütfen kaplanacak alanın m² değerini girin (örn: 150)'
    }

    // Taş tercihi: en az 1 seçilmeli veya "bilmiyorum" seçili olmalı
    if (selectedProducts.length === 0 && !bilmiyorum) {
      newErrors.tasTermihi = 'Lütfen bir taş türü seçin veya "Tavsiye İstiyorum" işaretleyin'
    }

    // İletişim tercihi: zorunlu
    if (!form.iletisimTuru) {
      newErrors.iletisimTuru = 'Lütfen iletişim tercihinizi seçin (Telefon, WhatsApp veya E-posta)'
    }

    // İlçe: zorunlu
    if (!form.ilce || form.ilce.trim().length < 2) {
      newErrors.ilce = 'Lütfen ilçe seçin'
    }

    // Bizi nerden buldunuz: zorunlu
    if (!form.kaynak) {
      newErrors.kaynak = 'Lütfen bizi nereden bulduğunuzu seçin'
    }

    setErrors(newErrors)
    // İlk hatalı alana scroll
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0]
      const el = document.querySelector(`[name="${firstErrorField}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
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
          ad_soyad: form.adSoyad, telefon: `${phoneCode} ${form.telefon}`, email: form.email,
          ulke: form.ulke, il: form.il, ilce: form.ilce,
          proje_tipi: form.projeTipi, tas_tercihi: tasTermihi,
          cephe_metre: form.cepheMetre ? parseInt(form.cepheMetre) : null,
          dis_kose_uzunluk: form.disKoseUzunluk ? parseInt(form.disKoseUzunluk) : null,
          fiyat_tipi: form.fiyatTipi,
          aciklama: form.aciklama, kaynak: form.kaynak,
          iletisim_turu: form.iletisimTuru, tercih_dil: form.tercihDil,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const teklifData = await res.json()

      // Upload images if any
      if (dosyalar.length > 0 && teklifData?.id) {
        try {
          const uploadForm = new FormData()
          uploadForm.append('teklif_id', teklifData.id)
          dosyalar.forEach(file => uploadForm.append('files', file))
          const uploadRes = await fetch('/api/teklifler/upload', { method: 'POST', body: uploadForm })
          if (!uploadRes.ok) console.error('Upload failed:', await uploadRes.text())
        } catch (err) {
          console.error('Upload error:', err)
        }
      }

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
    <form onSubmit={handleSubmit} className="glass-card p-5 sm:p-8 md:p-10 overflow-hidden">
      <div className="mb-8">
        <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-2">{t.form_free_quote}</p>
        <h3 className="font-heading text-2xl font-bold text-white">
          {t.form_title} <span className="text-gradient-gold">{t.form_title_gold}</span>
        </h3>
        <p className="text-white/20 text-[10px] font-mono mt-2"><span className="text-gold-400">*</span> zorunlu alanlar</p>
      </div>

      {simulationResult?.resultUrl && (
        <div className="mb-6 p-4 rounded-xl border border-gold-400/20 bg-gold-400/5">
          <p className="font-mono text-[10px] text-gold-400/70 tracking-wider uppercase mb-3">AI Simülasyon Sonucu</p>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="flex gap-3">
              {simulationResult.originalUrl && (
                <div className="flex flex-col items-center gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={simulationResult.originalUrl} alt="Orijinal" className="w-24 h-20 object-cover rounded-lg border border-white/10" />
                  <span className="text-white/30 text-[8px] font-mono">Önce</span>
                </div>
              )}
              <div className="flex flex-col items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={simulationResult.resultUrl} alt="Simülasyon" className="w-24 h-20 object-cover rounded-lg border border-gold-400/20" />
                <span className="text-gold-400/50 text-[8px] font-mono">Sonra</span>
              </div>
            </div>
            <div className="text-center sm:text-left sm:flex-1 sm:min-w-0 sm:pt-1">
              <p className="text-white text-sm font-medium">{simulationResult.stoneName}</p>
              <p className="text-white/40 text-xs mt-1">Bu simülasyon sonucuna göre teklif alıyorsunuz</p>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex gap-2">
              <select
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-2 py-3 text-white/70 text-sm font-mono shrink-0 appearance-none cursor-pointer focus:outline-none focus:border-gold-400/40"
              >
                <option value="+90" className="bg-[#1a1a1a]">🇹🇷 +90</option>
                <option value="+49" className="bg-[#1a1a1a]">🇩🇪 +49</option>
                <option value="+34" className="bg-[#1a1a1a]">🇪🇸 +34</option>
                <option value="+33" className="bg-[#1a1a1a]">🇫🇷 +33</option>
                <option value="+7" className="bg-[#1a1a1a]">🇷🇺 +7</option>
                <option value="+966" className="bg-[#1a1a1a]">🇸🇦 +966</option>
                <option value="+971" className="bg-[#1a1a1a]">🇦🇪 +971</option>
                <option value="+44" className="bg-[#1a1a1a]">🇬🇧 +44</option>
                <option value="+1" className="bg-[#1a1a1a]">🇺🇸 +1</option>
                <option value="+39" className="bg-[#1a1a1a]">🇮🇹 +39</option>
                <option value="+30" className="bg-[#1a1a1a]">🇬🇷 +30</option>
                <option value="+31" className="bg-[#1a1a1a]">🇳🇱 +31</option>
                <option value="+46" className="bg-[#1a1a1a]">🇸🇪 +46</option>
                <option value="+41" className="bg-[#1a1a1a]">🇨🇭 +41</option>
                <option value="+43" className="bg-[#1a1a1a]">🇦🇹 +43</option>
                <option value="+32" className="bg-[#1a1a1a]">🇧🇪 +32</option>
                <option value="+48" className="bg-[#1a1a1a]">🇵🇱 +48</option>
                <option value="+380" className="bg-[#1a1a1a]">🇺🇦 +380</option>
                <option value="+972" className="bg-[#1a1a1a]">🇮🇱 +972</option>
                <option value="+251" className="bg-[#1a1a1a]">🇪🇹 +251</option>
              </select>
              <input type="tel" name="telefon" required value={form.telefon}
                onChange={(e) => {
                  let val = e.target.value
                  if (form.ulke === 'Türkiye') {
                    const digits = val.replace(/[^0-9]/g, '').slice(0, 10)
                    // Auto-format: 532 258 41 11
                    if (digits.length <= 3) val = digits
                    else if (digits.length <= 6) val = `${digits.slice(0, 3)} ${digits.slice(3)}`
                    else if (digits.length <= 8) val = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
                    else val = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`
                  } else {
                    val = val.replace(/[^0-9\s]/g, '')
                  }
                  setForm(prev => ({ ...prev, telefon: val }))
                  if (errors.telefon) setErrors(prev => ({ ...prev, telefon: '' }))
                }}
                placeholder={form.ulke === 'Türkiye' ? '532 258 41 11' : '555 123 4567'}
                className={`${inputClass} flex-1 ${errors.telefon ? 'border-red-500/50' : ''}`} />
            </div>
            {errors.telefon && <p className="text-red-400 text-[10px] font-mono mt-1">{errors.telefon}</p>}
          </div>
        </div>

        <div>
          <label className="block text-white/50 text-xs font-mono mb-2">{t.form_email_label} <span className="text-gold-400">*</span></label>
          <input type="email" name="email" required value={form.email} onChange={handleChange}
            placeholder={t.form_email_placeholder}
            className={`${inputClass} ${errors.email ? 'border-red-500/50' : ''}`} />
          {errors.email && <p className="text-red-400 text-[10px] font-mono mt-1">{errors.email}</p>}
        </div>

        {/* İletişim Türü & Dil Tercihi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">{t.form_contact_type_label}</label>
            <div className="flex gap-2 overflow-hidden">
              {[
                { value: 'phone', label: t.form_contact_type_phone, icon: Phone },
                { value: 'email', label: t.form_contact_type_email, icon: Mail },
                { value: 'whatsapp', label: t.form_contact_type_whatsapp, icon: MessageCircle },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setForm(prev => ({ ...prev, iletisimTuru: opt.value }))}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-[11px] font-mono transition-all border ${
                    form.iletisimTuru === opt.value
                      ? 'bg-gold-400/20 border-gold-400/40 text-gold-400'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/20'
                  }`}>
                  <opt.icon size={14} className="shrink-0" />
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">{t.form_preferred_lang_label}</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {languages.map(lang => (
                <button key={lang.code} type="button"
                  onClick={() => setForm(prev => ({ ...prev, tercihDil: lang.code }))}
                  className={`shrink-0 flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-mono transition-all border ${
                    form.tercihDil === lang.code
                      ? 'bg-gold-400/20 border-gold-400/40 text-gold-400'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/20'
                  }`}>
                  <span className="text-sm">{lang.flag}</span>
                  <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
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
            <label className="block text-white/50 text-xs font-mono mb-2">{t.form_district_label} <span className="text-gold-400">*</span></label>
            {isTurkiye && form.il && availableDistricts.length > 0 ? (
              <select value={form.ilce} onChange={(e) => setForm(prev => ({ ...prev, ilce: e.target.value }))}
                className={`${inputClass} appearance-none cursor-pointer`}>
                <option value="" className="bg-[#1a1a1a]">Seçiniz</option>
                {availableDistricts.map(d => <option key={d} value={d} className="bg-[#1a1a1a]">{d}</option>)}
              </select>
            ) : (
              <input type="text" value={isTurkiye ? '' : form.ilce}
                onChange={(e) => setForm(prev => ({ ...prev, ilce: e.target.value }))}
                placeholder={isTurkiye ? (form.il ? t.form_district_placeholder : 'Önce il seçin') : t.form_district_placeholder}
                disabled={isTurkiye && !form.il}
                className={`${inputClass} ${isTurkiye && !form.il ? 'opacity-40 cursor-not-allowed' : ''}`} />
            )}
            {errors.ilce && <p className="text-red-400 text-[10px] font-mono mt-1">{errors.ilce}</p>}
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
            <label className="block text-white/50 text-xs font-mono mb-2">
              {t.form_facade_area || 'Kaplanacak Cephe (m²)'} <span className="text-gold-400">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="cepheMetre"
              placeholder={t.form_eg_150 || 'Örn: 150'}
              value={form.cepheMetre}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '')
                setForm(prev => ({ ...prev, cepheMetre: val }))
                if (errors.cepheMetre) setErrors(prev => ({ ...prev, cepheMetre: '' }))
              }}
              className={`${inputClass} ${errors.cepheMetre ? 'border-red-500/50' : ''}`}
            />
            {errors.cepheMetre && <p className="text-red-400 text-[10px] font-mono mt-1">{errors.cepheMetre}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              {t.form_corner_length || 'Dış Köşe Uzunluğu (metretül)'}
            </label>
            <input
              type="number"
              name="disKoseUzunluk"
              min="0"
              step="1"
              placeholder={t.form_eg_25 || 'Örn: 25'}
              value={form.disKoseUzunluk}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs font-mono mb-2">
              {t.form_price_scope || 'Fiyat Kapsamı'} <span className="text-gold-400">*</span>
            </label>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, fiyatTipi: 'sadece_tas' }))}
                className={`flex-1 px-3 py-3 rounded-xl text-xs font-body transition-all border ${
                  form.fiyatTipi === 'sadece_tas'
                    ? 'bg-gold-400/15 border-gold-400/50 text-gold-400'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06]'
                }`}
              >
                {t.form_stone_only || 'Sadece Taş'}
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, fiyatTipi: 'tas_ve_malzeme' }))}
                className={`flex-1 px-3 py-3 rounded-xl text-xs font-body transition-all border ${
                  form.fiyatTipi === 'tas_ve_malzeme'
                    ? 'bg-gold-400/15 border-gold-400/50 text-gold-400'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06]'
                }`}
              >
                {t.form_stone_plus || 'Taş + Yapıştırıcı + Derz'}
              </button>
            </div>
          </div>
        </div>

        {/* ═══ 3-STEP TAŞ SEÇİMİ ═══ */}
        <div>
          <label className="block text-white/50 text-xs font-mono mb-3">
            {t.form_stone_pref_label} <span className="text-gold-400">*</span> <span className="text-white/30">(max 4 ürün)</span>
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
          {errors.tasTermihi && <p className="text-red-400 text-[10px] font-mono mt-2">{errors.tasTermihi}</p>}
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
          <label className="block text-white/50 text-xs font-mono mb-2">{t.form_source_label} <span className="text-gold-400">*</span></label>
          <select name="kaynak" value={form.kaynak} onChange={handleChange}
            className={`${inputClass} appearance-none cursor-pointer ${errors.kaynak ? 'border-red-500/50' : ''}`}>
            <option value="" className="bg-[#1a1a1a]">{t.form_select_placeholder}</option>
            {kaynakSecenekleri.map(k => <option key={k} value={k} className="bg-[#1a1a1a]">{k}</option>)}
          </select>
          {errors.kaynak && <p className="text-red-400 text-[10px] font-mono mt-1">{errors.kaynak}</p>}
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
