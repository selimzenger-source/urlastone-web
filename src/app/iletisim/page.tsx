'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  ChevronDown,
  ExternalLink,
  Send,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function IletisimPage() {
  const { t } = useLanguage()
  const [selectedWaMessage, setSelectedWaMessage] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const waPresets = [
    { key: 'price', label: t.contact_wa_price_info },
    { key: 'sample', label: t.contact_wa_sample_request },
    { key: 'consult', label: t.contact_wa_project_consult },
    { key: 'export', label: t.contact_wa_export_info },
  ]

  const faqItems = [
    { q: t.faq_q1, a: t.faq_a1 },
    { q: t.faq_q2, a: t.faq_a2 },
    { q: t.faq_q3, a: t.faq_a3 },
    { q: t.faq_q4, a: t.faq_a4 },
    { q: t.faq_q5, a: t.faq_a5 },
    { q: t.faq_q6, a: t.faq_a6 },
  ]

  const getWhatsAppUrl = () => {
    const message =
      selectedWaMessage === 'custom'
        ? customMessage
        : waPresets.find((p) => p.key === selectedWaMessage)?.label || ''
    return `https://wa.me/905532322144?text=${encodeURIComponent(message)}`
  }

  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
            {t.contact_tag}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            <span className="text-gradient-gold">{t.contact_title}</span>
          </h1>
          <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto font-mono">
            {t.contact_desc_main}
          </p>
        </div>
      </section>

      {/* Two Column Layout: WhatsApp + Visit */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* WhatsApp Section */}
          <div className="glass-card p-6 md:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={28} className="text-green-400" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">
                {t.contact_tab_whatsapp}
              </h2>
              <p className="text-white/40 text-sm font-mono">{t.contact_wa_select_message}</p>
            </div>

            {/* Preset Messages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {waPresets.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => {
                    setSelectedWaMessage(preset.key)
                    setCustomMessage('')
                  }}
                  className={`
                    p-4 rounded-xl text-left text-sm font-mono transition-all duration-300 border
                    ${
                      selectedWaMessage === preset.key
                        ? 'border-gold-400/40 bg-gold-400/10 text-gold-400'
                        : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:border-white/10 hover:bg-white/[0.04]'
                    }
                  `}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Message */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setSelectedWaMessage('custom')
                }}
                className={`
                  w-full p-4 rounded-xl text-left text-sm font-mono transition-all duration-300 border mb-3
                  ${
                    selectedWaMessage === 'custom'
                      ? 'border-gold-400/40 bg-gold-400/10 text-gold-400'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:border-white/10 hover:bg-white/[0.04]'
                  }
                `}
              >
                {t.contact_wa_custom_message}
              </button>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  selectedWaMessage === 'custom' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={t.contact_wa_custom_placeholder}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Send Button */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                flex items-center justify-center gap-3 w-full py-4 rounded-xl text-sm font-mono uppercase tracking-wider transition-all duration-300
                ${
                  selectedWaMessage
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 cursor-pointer'
                    : 'bg-white/[0.02] text-white/20 border border-white/[0.06] pointer-events-none'
                }
              `}
            >
              <Send size={16} />
              {t.contact_wa_send_btn}
            </a>

            {/* Direct WhatsApp link */}
            <div className="mt-6 text-center">
              <a
                href="https://wa.me/905532322144"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/40 text-xs font-mono hover:text-green-400 transition-colors"
              >
                <Phone size={12} />
                +90 553 232 2144
              </a>
            </div>
          </div>

          {/* Visit Section */}
          <div className="glass-card p-6 md:p-10">
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-white mb-3">
                {t.contact_visit_title}
              </h2>
              <p className="text-white/40 text-sm font-mono leading-relaxed">
                {t.contact_visit_desc}
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-gold-400" />
                </div>
                <div>
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-1">
                    {t.contact_address_label}
                  </p>
                  <p className="text-white text-sm whitespace-pre-line">
                    {t.contact_address_value}
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-gold-400" />
                </div>
                <div>
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-1">
                    {t.contact_working_hours}
                  </p>
                  <p className="text-white text-sm">{t.contact_hours_value}</p>
                  <p className="text-white/40 text-xs mt-1">
                    {t.contact_weekend}: {t.contact_weekend_value}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-gold-400" />
                </div>
                <div>
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-1">
                    {t.contact_phone_label}
                  </p>
                  <a
                    href="tel:+905532322144"
                    className="text-white text-sm hover:text-gold-400 transition-colors"
                  >
                    +90 553 232 2144
                  </a>
                </div>
              </div>
            </div>

            {/* Directions Button */}
            <a
              href="https://www.google.com/maps/dir//URLA+DO%C4%9EAL+TA%C5%9E+PAZARI+-+URLA+STONE,+Alt%C4%B1nta%C5%9F,+%C4%B0zmir+%C3%87e%C5%9Fme+Cd.+NO:+319,+35430+Urla%2F%C4%B0zmir"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-mono uppercase tracking-wider hover:bg-gold-400/20 transition-all duration-300 mb-6"
            >
              <ExternalLink size={14} />
              {t.contact_directions_btn}
            </a>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-white/[0.06] h-[250px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3131.5!2d26.734641!3d38.3248805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14bb932e921f61b1%3A0xa0c4c3685f54e796!2sURLA%20DO%C4%9EAL%20TA%C5%9E%20PAZARI%20-%20URLA%20STONE!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter: 'invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)',
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Urlastone Konum"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">
              <span className="text-gradient-gold">{t.faq_title}</span>
            </h2>
            <p className="text-white/40 text-sm font-mono">{t.faq_desc}</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="glass-card overflow-hidden transition-all duration-300 hover:border-white/10"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                  >
                    <span className="text-white text-sm md:text-base font-medium pr-4">
                      {item.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-gold-400 flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
                      <div className="border-t border-white/[0.06] pt-4">
                        <p className="text-white/50 text-sm leading-relaxed font-mono">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
