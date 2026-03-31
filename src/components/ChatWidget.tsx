'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { MessageCircle, X, Send, Loader2, ChevronDown, Paperclip, Image as ImageIcon } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  attachment?: { name: string; type: string; url?: string }
}

interface LeadInfo {
  name: string
  email: string
  phone: string
}

const SPAM_KEY = 'urlastone_chat_guard'

// 7 dilde çeviriler
const chatTranslations: Record<string, {
  greeting: string
  formTitle: string
  formDesc: string
  namePlaceholder: string
  emailPlaceholder: string
  phonePlaceholder: string
  send: string
  submit: string
  placeholder: string
  welcome: string
  nameRequired: string
  phoneRequired: string
  tooManyMessages: string
  blocked: string
  newChat: string
  privacy: string
}> = {
  tr: {
    greeting: 'URLASTONE',
    formTitle: 'Size daha iyi yardımcı olabilmemiz için bilgilerinizi doldurun',
    formDesc: '',
    namePlaceholder: 'Adınız',
    emailPlaceholder: 'E-posta (isteğe bağlı)',
    phonePlaceholder: '5XX XXX XX XX',
    send: 'Gönder',
    submit: 'Sohbete Başla',
    placeholder: 'Mesajınızı yazın...',
    welcome: 'Merhaba {name}! Size nasıl yardımcı olabilirim?',
    nameRequired: 'Lütfen adınızı girin',
    phoneRequired: 'Lütfen telefon numaranızı girin',
    tooManyMessages: 'Çok fazla mesaj gönderdiniz. Lütfen biraz bekleyin.',
    blocked: 'Oturumunuz geçici olarak askıya alındı.',
    newChat: 'Yeni Konuşma',
    privacy: 'Bilgileriniz KVKK kapsamında gizli tutulur. İzniniz olmadan arama veya e-posta gönderilmez.',
  },
  en: {
    greeting: 'URLASTONE',
    formTitle: 'Please fill in your details so we can assist you better',
    formDesc: '',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'Email (optional)',
    phonePlaceholder: 'Phone number',
    send: 'Send',
    submit: 'Start Chat',
    placeholder: 'Type your message...',
    welcome: 'Hello {name}! How can I help you?',
    nameRequired: 'Please enter your name',
    phoneRequired: 'Please enter your phone number',
    tooManyMessages: 'Too many messages. Please wait a moment.',
    blocked: 'Your session has been temporarily suspended.',
    newChat: 'New Chat',
    privacy: 'Your information is kept confidential under GDPR. You will not be called or emailed without your permission.',
  },
  es: {
    greeting: 'URLASTONE',
    formTitle: 'Rellene sus datos para poder ayudarle mejor',
    formDesc: '',
    namePlaceholder: 'Su nombre',
    emailPlaceholder: 'Email (opcional)',
    phonePlaceholder: 'Teléfono',
    send: 'Enviar',
    submit: 'Iniciar Chat',
    placeholder: 'Escriba su mensaje...',
    welcome: 'Hola {name}! ¿Cómo puedo ayudarle?',
    nameRequired: 'Por favor ingrese su nombre',
    phoneRequired: 'Por favor ingrese su teléfono',
    tooManyMessages: 'Demasiados mensajes. Espere un momento.',
    blocked: 'Su sesión ha sido suspendida temporalmente.',
    newChat: 'Nueva Conversación',
    privacy: 'Su información se mantiene confidencial bajo el RGPD. No será contactado sin su permiso.',
  },
  de: {
    greeting: 'URLASTONE',
    formTitle: 'Bitte füllen Sie Ihre Daten aus, damit wir Ihnen besser helfen können',
    formDesc: '',
    namePlaceholder: 'Ihr Name',
    emailPlaceholder: 'E-Mail (optional)',
    phonePlaceholder: 'Telefonnummer',
    send: 'Senden',
    submit: 'Chat starten',
    placeholder: 'Nachricht eingeben...',
    welcome: 'Hallo {name}! Wie kann ich Ihnen helfen?',
    nameRequired: 'Bitte geben Sie Ihren Namen ein',
    phoneRequired: 'Bitte geben Sie Ihre Telefonnummer ein',
    tooManyMessages: 'Zu viele Nachrichten. Bitte warten Sie einen Moment.',
    blocked: 'Ihre Sitzung wurde vorübergehend gesperrt.',
    newChat: 'Neues Gespräch',
    privacy: 'Ihre Daten werden gemaess DSGVO vertraulich behandelt. Ohne Ihre Erlaubnis werden Sie nicht kontaktiert.',
  },
  fr: {
    greeting: 'URLASTONE',
    formTitle: 'Veuillez remplir vos coordonnées pour que nous puissions mieux vous aider',
    formDesc: '',
    namePlaceholder: 'Votre nom',
    emailPlaceholder: 'Email (facultatif)',
    phonePlaceholder: 'Téléphone',
    send: 'Envoyer',
    submit: 'Démarrer le chat',
    placeholder: 'Écrivez votre message...',
    welcome: 'Bonjour {name} ! Comment puis-je vous aider ?',
    nameRequired: 'Veuillez entrer votre nom',
    phoneRequired: 'Veuillez entrer votre numéro de téléphone',
    tooManyMessages: 'Trop de messages. Veuillez patienter.',
    blocked: 'Votre session a été temporairement suspendue.',
    newChat: 'Nouvelle Conversation',
    privacy: 'Vos informations sont protegees conformement au RGPD. Vous ne serez pas contacte sans votre autorisation.',
  },
  ru: {
    greeting: 'URLASTONE',
    formTitle: 'Пожалуйста, заполните ваши данные, чтобы мы могли лучше вам помочь',
    formDesc: '',
    namePlaceholder: 'Ваше имя',
    emailPlaceholder: 'Email (необязательно)',
    phonePlaceholder: 'Телефон',
    send: 'Отправить',
    submit: 'Начать чат',
    placeholder: 'Напишите сообщение...',
    welcome: 'Здравствуйте, {name}! Чем могу помочь?',
    nameRequired: 'Пожалуйста, введите ваше имя',
    phoneRequired: 'Пожалуйста, введите номер телефона',
    tooManyMessages: 'Слишком много сообщений. Подождите немного.',
    blocked: 'Ваша сессия временно приостановлена.',
    newChat: 'Новый Разговор',
    privacy: 'Ваши данные хранятся конфиденциально. Без вашего разрешения звонки и письма не отправляются.',
  },
  ar: {
    greeting: 'URLASTONE',
    formTitle: 'يرجى ملء بياناتك حتى نتمكن من مساعدتك بشكل أفضل',
    formDesc: '',
    namePlaceholder: 'اسمك',
    emailPlaceholder: 'البريد الإلكتروني (اختياري)',
    phonePlaceholder: 'رقم الهاتف',
    send: 'إرسال',
    submit: 'ابدأ المحادثة',
    placeholder: '...اكتب رسالتك',
    welcome: 'مرحبا {name}! كيف يمكنني مساعدتك؟',
    nameRequired: 'يرجى إدخال اسمك',
    phoneRequired: 'يرجى إدخال رقم هاتفك',
    tooManyMessages: 'رسائل كثيرة جدا. يرجى الانتظار قليلا.',
    blocked: 'تم تعليق جلستك مؤقتا.',
    newChat: 'محادثة جديدة',
    privacy: 'معلوماتك محفوظة بسرية. لن يتم الاتصال بك أو مراسلتك بدون إذنك.',
  },
}

function getSpamData() {
  try {
    const raw = localStorage.getItem(SPAM_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      const today = new Date().toDateString()
      if (data.date !== today) return { msgs: [], sessions: 0, date: today, blocked: false, blockedUntil: 0 }
      if (data.blocked && data.blockedUntil && Date.now() > data.blockedUntil) return { ...data, blocked: false, blockedUntil: 0 }
      return data
    }
  } catch {}
  return { msgs: [], sessions: 0, date: new Date().toDateString(), blocked: false, blockedUntil: 0 }
}

function saveSpamData(data: Record<string, unknown>) {
  try { localStorage.setItem(SPAM_KEY, JSON.stringify(data)) } catch {}
}

// Markdown linklerini HTML'e çevir
function formatMessage(text: string): string {
  // |||SHOW_CONTACT_FORM||| kaldır
  let formatted = text.replace(/\|\|\|SHOW_CONTACT_FORM\|\|\|/g, '')
  // [text](url) → <a> linkleri
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-[#d2b96e] underline hover:text-[#e0c97a] transition-colors">$1</a>')
  // **bold** → <strong>
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // Satır sonları
  formatted = formatted.replace(/\n/g, '<br/>')
  return formatted
}

export default function ChatWidget() {
  const { locale } = useLanguage()
  const t = chatTranslations[locale] || chatTranslations.en

  const [isOpen, setIsOpen] = useState(false)
  const [phase, setPhase] = useState<'form' | 'chat'>('form')
  const [lead, setLead] = useState<LeadInfo>({ name: '', email: '', phone: '' })
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showContactForm, setShowContactForm] = useState(false)
  const [pendingFile, setPendingFile] = useState<{ file: File; previewUrl?: string } | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // Spam kontrolü
  const spamData = getSpamData()
  const isBlocked = spamData.blocked

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!lead.name.trim()) { setError(t.nameRequired); return }

    // İsim doğrulama: en az 2 kelime, sadece harf ve boşluk, anlamsız tekrar yok
    const nameVal = lead.name.trim()
    const nameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜáéíóúàèìòùâêîôûäëïöüñÑ\s'-]{2,50}$/
    const hasVowel = /[aeıioöuüAEIİOÖUÜáéíóúàèìòù]/i.test(nameVal)
    const repeatingChars = /(.)\1{2,}/.test(nameVal.replace(/\s/g, ''))
    const tooManyConsonants = /[^aeıioöuüAEIİOÖUÜáéíóúàèìòù\s'-]{5,}/i.test(nameVal)

    if (!nameRegex.test(nameVal) || !hasVowel || repeatingChars || tooManyConsonants) {
      const invalidName: Record<string, string> = {
        tr: 'Lütfen gerçek adınızı ve soyadınızı girin.',
        en: 'Please enter your real name.',
        es: 'Por favor ingrese su nombre real.',
        de: 'Bitte geben Sie Ihren echten Namen ein.',
        fr: 'Veuillez entrer votre vrai nom.',
        ru: 'Пожалуйста, введите ваше настоящее имя.',
        ar: 'يرجى إدخال اسمك الحقيقي.',
      }
      setError(invalidName[locale] || invalidName.en)
      return
    }

    if (!lead.phone.trim()) { setError(t.phoneRequired); return }

    // Lead'i kaydet
    try {
      await fetch('/api/chat/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, locale }),
      })
    } catch {}

    // Oturum sayacı
    const sd = getSpamData()
    sd.sessions += 1
    if (sd.sessions > 10) {
      sd.blocked = true
      sd.blockedUntil = Date.now() + 24 * 60 * 60 * 1000
      saveSpamData(sd)
      return
    }
    saveSpamData(sd)

    // Karşılama mesajı
    setMessages([{ role: 'assistant', content: t.welcome.replace('{name}', lead.name.split(' ')[0]) }])
    setPhase('chat')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    // Bekleyen dosya varsa, not olarak gönder
    if (pendingFile) {
      await sendFileWithNote(input.trim())
      setInput('')
      return
    }

    // Rate limit kontrolü
    const sd = getSpamData()
    const now = Date.now()
    sd.msgs = (sd.msgs || []).filter((t: number) => t > now - 60000)
    if (sd.msgs.length >= 5) {
      setError(t.tooManyMessages)
      return
    }
    sd.msgs.push(now)
    saveSpamData(sd)

    const userMsg = input.trim()
    setInput('')
    setError('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }],
        }),
      })

      if (res.status === 429) {
        setError(t.tooManyMessages)
        setLoading(false)
        return
      }

      const data = await res.json()
      if (data.message) {
        // İletişim formu tetikleyicisi kontrolü
        if (data.message.includes('|||SHOW_CONTACT_FORM|||')) {
          setShowContactForm(true)
        }
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Bir hata oluştu. Lütfen tekrar deneyin.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || loading) return
    e.target.value = '' // reset input

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError(locale === 'tr' ? 'Dosya en fazla 10MB olabilir.' : 'File size max 10MB.')
      return
    }

    const isImage = file.type.startsWith('image/')
    const previewUrl = isImage ? URL.createObjectURL(file) : undefined
    setPendingFile({ file, previewUrl })

    // Not iste
    const notePrompt = locale === 'tr'
      ? `Dosya secildi: ${file.name}. Bu dosya hakkinda notunuzu yazin ve gonderin.`
      : `File selected: ${file.name}. Please write a note about this file and send.`
    setMessages(prev => [...prev, { role: 'assistant', content: notePrompt }])
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const sendFileWithNote = async (note: string) => {
    if (!pendingFile) return
    const { file, previewUrl } = pendingFile

    const isImage = file.type.startsWith('image/')
    const label = isImage ? '📷' : '📎'

    // Mesaj olarak göster
    setMessages(prev => [...prev, {
      role: 'user',
      content: `${label} ${file.name}\n${note}`,
      attachment: { name: file.name, type: file.type, url: previewUrl },
    }])
    setPendingFile(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', lead.name)
      formData.append('phone', lead.phone)
      formData.append('locale', locale)
      formData.append('note', note)

      const res = await fetch('/api/chat/file', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.blocked) {
        // Müstehcen - engellendi
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
        }])
        // Chat'i kapat
        setTimeout(() => { setPhase('form'); setMessages([]) }, 3000)
      } else if (data.rejected) {
        // Konu dışı resim reddedildi
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message || (locale === 'tr'
            ? 'Bu resim konumuzla ilgili gorunmuyor. Lutfen dogal tas, yapi veya proje ile ilgili resimler gonderin.'
            : 'This image doesn\'t seem related to our business.'),
        }])
      } else if (data.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: locale === 'tr'
            ? 'Dosyaniz ve notunuz alindi, ekibimiz inceleyecek. Baska bir sorunuz var mi?'
            : 'Your file and note have been received. Our team will review it. Any other questions?',
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: locale === 'tr' ? 'Dosya gonderilemedi.' : 'File could not be sent.',
      }])
    } finally {
      setLoading(false)
    }
  }

  // Sohbet özeti gönder (2 dk inaktivite veya chat kapanınca)
  const summarySentRef = useRef(false)
  const summaryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sendSummary = useCallback(() => {
    if (summarySentRef.current || messages.length <= 1) return
    summarySentRef.current = true
    fetch('/api/chat/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: lead.name, phone: lead.phone, email: lead.email, messages, locale }),
    }).catch(() => {})
  }, [messages, lead, locale])

  // Her mesajda 2 dk timer'ı sıfırla
  useEffect(() => {
    if (phase !== 'chat' || messages.length <= 1) return
    summarySentRef.current = false
    if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current)
    summaryTimerRef.current = setTimeout(sendSummary, 120000) // 2 dk
    return () => { if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current) }
  }, [messages, phase, sendSummary])

  const handleNewChat = () => {
    if (messages.length > 1) sendSummary() // kapanırken özet gönder
    setPhase('form')
    setMessages([])
    setLead({ name: '', email: '', phone: '' })
    setShowContactForm(false)
    setError('')
    summarySentRef.current = false
  }

  // 15 saniyede bir otomatik tanıtım baloncuğu (döngüsel)
  const [showGreeting, setShowGreeting] = useState(false)

  useEffect(() => {
    if (isOpen) { setShowGreeting(false); return }

    const show = () => setShowGreeting(true)
    const hide = () => setShowGreeting(false)

    // İlk giriş: 4 saniye sonra göster
    const firstTimer = setTimeout(() => {
      show()
      setTimeout(hide, 6000)
    }, 4000)

    // Sonra her 20 saniyede tekrarla
    const interval = setInterval(() => {
      show()
      setTimeout(hide, 6000)
    }, 26000)

    return () => { clearTimeout(firstTimer); clearInterval(interval) }
  }, [isOpen])

  if (isBlocked) return null

  const greetingTexts: Record<string, string> = {
    tr: 'Merhaba! Ben Uri, AI asistanınız. Yardıma ihtiyacınız olursa buradayım',
    en: 'Hi! I\'m Uri, your AI assistant. I\'m here if you need help',
    es: 'Hola! Soy Uri, su asistente IA. Estoy aqui si necesita ayuda',
    de: 'Hallo! Ich bin Uri, Ihr KI-Assistent. Ich bin hier, wenn Sie Hilfe brauchen',
    fr: 'Bonjour! Je suis Uri, votre assistant IA. Je suis la si vous avez besoin',
    ru: 'Привет! Я Ури, ваш ИИ-ассистент. Я здесь, если нужна помощь',
    ar: 'مرحبا! أنا أوري، مساعدك الذكي. أنا هنا إذا احتجت مساعدة',
  }

  return (
    <>
      {/* Floating Button + Greeting */}
      {!isOpen && (
        <div className="fixed bottom-8 right-6 z-50 flex flex-col items-end gap-3">
          {/* Auto greeting bubble */}
          {showGreeting && (
            <div
              className="bg-[#111] border border-white/[0.1] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[260px] shadow-2xl animate-fade-in-up cursor-pointer"
              onClick={() => { setShowGreeting(false); setIsOpen(true) }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg animate-wave">👋</span>
                <p className="text-white/80 text-[13px] font-body leading-snug">{greetingTexts[locale] || greetingTexts.en}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => { setShowGreeting(false); setIsOpen(true) }}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 animate-chat-pulse"
            style={{ background: 'linear-gradient(135deg, #b39345, #d2b96e)' }}
            aria-label="Chat"
          >
            <MessageCircle size={26} className="text-black" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08] animate-fade-in-up"
          style={{ height: 'min(580px, calc(100vh - 100px))', background: '#111111' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]"
            style={{ background: 'linear-gradient(135deg, #1a1a1a, #111)' }}>
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ur2-dark.png" alt="" className="w-8 h-8 rounded-lg object-contain" />
              <div>
                <div className="font-heading text-sm font-bold tracking-wider">
                  <span className="text-[#b39345]">URLA</span><span className="text-white">STONE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-white/40 font-body">Uri - AI Assistant</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {phase === 'chat' && (
                <button onClick={handleNewChat} className="text-white/40 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/5" title={t.newChat}>
                  <ChevronDown size={16} />
                </button>
              )}
              <button onClick={() => { if (phase === 'chat' && messages.length > 1) sendSummary(); setIsOpen(false) }} className="text-white/40 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/5">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Form Phase */}
          {phase === 'form' && (
            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-center px-5 py-6 gap-4">
              <p className="text-white/70 text-sm text-center font-body leading-relaxed">{t.formTitle}</p>

              <input
                type="text"
                value={lead.name}
                onChange={e => setLead({ ...lead, name: e.target.value })}
                placeholder={t.namePlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 text-sm font-body outline-none focus:border-[#b39345]/50 transition-colors"
                autoFocus
              />
              <input
                type="email"
                value={lead.email}
                onChange={e => setLead({ ...lead, email: e.target.value })}
                placeholder={t.emailPlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 text-sm font-body outline-none focus:border-[#b39345]/50 transition-colors"
              />
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1]">
                <span className="text-white/50 text-sm">🇹🇷</span>
                <span className="text-white/40 text-sm">+90</span>
                <input
                  type="tel"
                  value={lead.phone}
                  onChange={e => setLead({ ...lead, phone: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder={t.phonePlaceholder}
                  className="flex-1 bg-transparent text-white placeholder-white/30 text-sm font-body outline-none"
                />
              </div>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <p className="text-white/30 text-[10px] text-center leading-relaxed font-body px-2">{t.privacy}</p>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-body font-semibold text-sm text-black transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #b39345, #d2b96e)' }}
              >
                {t.submit}
              </button>
            </form>
          )}

          {/* Chat Phase */}
          {phase === 'chat' && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed font-body ${
                        msg.role === 'user'
                          ? 'bg-[#b39345]/20 text-white rounded-br-md'
                          : 'bg-white/[0.06] text-white/90 rounded-bl-md'
                      }`}
                    >
                      {msg.attachment?.url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={msg.attachment.url} alt={msg.attachment.name} className="max-w-full max-h-40 rounded-lg mb-1.5 object-cover" />
                      )}
                      <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.06] px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-[#b39345]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-[#b39345]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-[#b39345]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* İletişim formu (bot tetiklediğinde) */}
                {showContactForm && (
                  <div className="bg-white/[0.06] rounded-2xl p-4 border border-[#b39345]/20">
                    <p className="text-white/60 text-xs mb-3 font-body">
                      {locale === 'tr' ? 'Hızlı iletişim:' : 'Quick contact:'}
                    </p>
                    <div className="flex flex-col gap-2">
                      <a href="https://wa.me/905532322144" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600/20 text-green-400 text-xs hover:bg-green-600/30 transition-colors">
                        WhatsApp: +90 553 232 21 44
                      </a>
                      <a href="tel:+905532322144"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#b39345]/10 text-[#d2b96e] text-xs hover:bg-[#b39345]/20 transition-colors">
                        {locale === 'tr' ? 'Hemen Ara' : 'Call Now'}: +90 553 232 21 44
                      </a>
                      <a href="https://www.urlastone.com/iletisim" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06] text-white/70 text-xs hover:bg-white/[0.1] transition-colors">
                        {locale === 'tr' ? 'İletişim Formu' : 'Contact Form'}
                      </a>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-3 pb-3 pt-1">
                {error && <p className="text-red-400 text-[10px] text-center mb-1">{error}</p>}
                {/* Bekleyen dosya önizleme */}
                {pendingFile && (
                  <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-[#b39345]/10 rounded-lg border border-[#b39345]/20">
                    {pendingFile.previewUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={pendingFile.previewUrl} alt="" className="w-10 h-10 rounded object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-[11px] truncate">{pendingFile.file.name}</p>
                      <p className="text-[#d2b96e] text-[10px]">{locale === 'tr' ? 'Notunuzu yazin ve gonderin' : 'Write your note and send'}</p>
                    </div>
                    <button onClick={() => setPendingFile(null)} className="text-white/30 hover:text-white/60 p-1"><X size={14} /></button>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-white/[0.06] rounded-xl border border-white/[0.08] px-2.5 py-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.dwg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="p-1 rounded-lg transition-all hover:bg-white/[0.06] disabled:opacity-30"
                    style={{ color: '#888' }}
                    title={locale === 'tr' ? 'Dosya ekle' : 'Attach file'}
                  >
                    <Paperclip size={16} />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={t.placeholder}
                    className="flex-1 bg-transparent text-white placeholder-white/30 text-sm font-body outline-none"
                    disabled={loading}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="p-1.5 rounded-lg transition-all disabled:opacity-30"
                    style={{ color: '#d2b96e' }}
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
