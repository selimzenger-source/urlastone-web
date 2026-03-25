import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const ADMIN_EMAILS = (process.env.ADMIN_NOTIFICATION_EMAILS || 'info@urlastone.com,cihanzenger@gmail.com')
  .split(',')
  .map(e => e.trim())

interface TeklifData {
  ad_soyad: string
  telefon: string
  email?: string
  ulke: string
  il: string
  ilce?: string
  proje_tipi: string
  tas_tercihi: string[]
  metrekare?: string
  cephe_metre?: number | string
  aciklama?: string
  kaynak?: string
  iletisim_turu?: string
  tercih_dil?: string
}

// Email çevirileri
const emailTranslations: Record<string, {
  subject: string
  subtitle: string
  heading: string
  greeting: (name: string) => string
  body: string
  summaryTitle: string
  projectType: string
  location: string
  area: string
  stonePreference: string
  contactPreference: string
  responseTime: string
  responseNote: string
  contactTitle: string
  footer: string
  contactTypes: Record<string, string>
}> = {
  tr: {
    subject: 'Teklif Talebiniz Alındı',
    subtitle: 'DOĞAL TAŞ',
    heading: 'Talebiniz Alındı',
    greeting: (name) => `Sayın <strong style="color:#d2b96e;">${name}</strong>, teklif talebiniz başarıyla alınmıştır.`,
    body: 'En kısa sürede sizinle iletişime geçeceğiz.',
    summaryTitle: 'Talep Özeti',
    projectType: 'Proje Tipi',
    location: 'Konum',
    area: 'Kaplanacak Alan',
    stonePreference: 'Taş Tercihi',
    contactPreference: 'İletişim Tercihi',
    responseTime: 'Genellikle <strong style="color:#999;">24 saat</strong> içinde dönüş yapıyoruz. Acil durumlar için bizi doğrudan arayabilirsiniz.',
    responseNote: '',
    contactTitle: 'İletişim',
    footer: 'Bu e-posta otomatik olarak gönderilmiştir',
    contactTypes: { phone: 'Telefon', email: 'E-posta', whatsapp: 'WhatsApp' },
  },
  en: {
    subject: 'Your Quote Request Has Been Received',
    subtitle: 'NATURAL STONE',
    heading: 'Request Received',
    greeting: (name) => `Dear <strong style="color:#d2b96e;">${name}</strong>, your quote request has been successfully received. We will contact you shortly.`,
    body: 'We will get back to you as soon as possible.',
    summaryTitle: 'Request Summary',
    projectType: 'Project Type',
    location: 'Location',
    area: 'Area',
    stonePreference: 'Stone Preference',
    contactPreference: 'Contact Preference',
    responseTime: 'We typically respond within <strong style="color:#999;">24 hours</strong>. For urgent matters, you can call us directly.',
    responseNote: '',
    contactTitle: 'Contact',
    footer: 'This email was sent automatically',
    contactTypes: { phone: 'Phone', email: 'Email', whatsapp: 'WhatsApp' },
  },
  es: {
    subject: 'Su Solicitud de Cotizacion Ha Sido Recibida',
    subtitle: 'PIEDRA NATURAL',
    heading: 'Solicitud Recibida',
    greeting: (name) => `Estimado/a <strong style="color:#d2b96e;">${name}</strong>, su solicitud de cotizacion ha sido recibida exitosamente. Nos pondremos en contacto con usted a la brevedad.`,
    body: 'Nos comunicaremos con usted lo antes posible.',
    summaryTitle: 'Resumen de la Solicitud',
    projectType: 'Tipo de Proyecto',
    location: 'Ubicacion',
    area: 'Area',
    stonePreference: 'Preferencia de Piedra',
    contactPreference: 'Preferencia de Contacto',
    responseTime: 'Normalmente respondemos en <strong style="color:#999;">24 horas</strong>. Para asuntos urgentes, puede llamarnos directamente.',
    responseNote: '',
    contactTitle: 'Contacto',
    footer: 'Este correo fue enviado automaticamente',
    contactTypes: { phone: 'Telefono', email: 'Correo electronico', whatsapp: 'WhatsApp' },
  },
  ar: {
    subject: 'URLASTONE — تم استلام طلب العرض الخاص بك',
    subtitle: 'حجر طبيعي',
    heading: 'تم استلام طلبك',
    greeting: (name) => `عزيزي/عزيزتي <strong style="color:#d2b96e;">${name}</strong>، تم استلام طلب العرض الخاص بك بنجاح. سنتواصل معك في اقرب وقت.`,
    body: 'سنعود اليك في اقرب وقت ممكن.',
    summaryTitle: 'ملخص الطلب',
    projectType: 'نوع المشروع',
    location: 'الموقع',
    area: 'المساحة',
    stonePreference: 'تفضيل الحجر',
    contactPreference: 'طريقة التواصل',
    responseTime: 'نرد عادة خلال <strong style="color:#999;">24 ساعة</strong>. للحالات العاجلة، يمكنك الاتصال بنا مباشرة.',
    responseNote: '',
    contactTitle: 'التواصل',
    footer: 'تم ارسال هذا البريد تلقائيا',
    contactTypes: { phone: 'هاتف', email: 'بريد الكتروني', whatsapp: 'واتساب' },
  },
  de: {
    subject: 'Ihre Angebotsanfrage wurde erhalten',
    subtitle: 'NATURSTEIN',
    heading: 'Anfrage erhalten',
    greeting: (name) => `Sehr geehrte/r <strong style="color:#d2b96e;">${name}</strong>, Ihre Angebotsanfrage wurde erfolgreich erhalten. Wir werden uns in Kurze mit Ihnen in Verbindung setzen.`,
    body: 'Wir melden uns so schnell wie moglich bei Ihnen.',
    summaryTitle: 'Anfragezusammenfassung',
    projectType: 'Projekttyp',
    location: 'Standort',
    area: 'Flache',
    stonePreference: 'Steinpraferenz',
    contactPreference: 'Kontaktpraferenz',
    responseTime: 'Wir antworten normalerweise innerhalb von <strong style="color:#999;">24 Stunden</strong>. Bei dringenden Angelegenheiten konnen Sie uns direkt anrufen.',
    responseNote: '',
    contactTitle: 'Kontakt',
    footer: 'Diese E-Mail wurde automatisch gesendet',
    contactTypes: { phone: 'Telefon', email: 'E-Mail', whatsapp: 'WhatsApp' },
  },
}

// Musteriye giden onay maili
export async function sendCustomerConfirmation(data: TeklifData) {
  if (!data.email) return

  const lang = data.tercih_dil && emailTranslations[data.tercih_dil] ? data.tercih_dil : 'tr'
  const t = emailTranslations[lang]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const contactLabel = data.iletisim_turu ? (t.contactTypes[data.iletisim_turu] || data.iletisim_turu) : ''

  const areaValue = data.cephe_metre || data.metrekare || ''

  const html = `
<!DOCTYPE html>
<html dir="${dir}">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;direction:${dir};">
  <div style="max-width:600px;margin:0 auto;background:#0a0a0a;overflow:hidden;margin-top:0;margin-bottom:0;">

    <!-- Header with Logo -->
    <div style="background:#0a0a0a;padding:28px 32px;text-align:center;border-bottom:2px solid #b39345;">
      <img src="https://www.urlastone.com/logo-stone.png" alt="URLASTONE" width="48" height="48" style="display:inline-block;vertical-align:middle;margin-right:12px;border-radius:8px;" />
      <span style="display:inline-block;vertical-align:middle;">
        <span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:3px;">URLA</span><span style="font-size:24px;font-weight:300;color:#ffffff;letter-spacing:3px;">STONE</span>
      </span>
      <p style="margin:6px 0 0;font-size:11px;color:#b39345;letter-spacing:2px;text-transform:uppercase;">${t.subtitle}</p>
    </div>

    <!-- Gold accent bar -->
    <div style="height:3px;background:linear-gradient(90deg,#b39345,#d2b96e,#b39345);"></div>

    <!-- Body -->
    <div style="padding:32px;">
      <h2 style="color:#b39345;font-size:22px;margin:0 0 16px;font-weight:600;">${t.heading}</h2>
      <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 28px;">
        ${t.greeting(data.ad_soyad)}
      </p>

      <!-- Talep Özeti -->
      <div style="background:#141414;border:1px solid #222;border-radius:12px;padding:24px;margin-bottom:28px;">
        <h3 style="color:#b39345;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 20px;border-bottom:1px solid #222;padding-bottom:12px;">${t.summaryTitle}</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#666;font-size:12px;padding:8px 0;vertical-align:top;width:150px;">${t.projectType}</td>
            <td style="color:#ddd;font-size:13px;padding:8px 0;font-weight:500;">${data.proje_tipi}</td>
          </tr>
          <tr style="border-top:1px solid #1a1a1a;">
            <td style="color:#666;font-size:12px;padding:8px 0;vertical-align:top;">${t.location}</td>
            <td style="color:#ddd;font-size:13px;padding:8px 0;">${data.ilce ? data.ilce + ', ' : ''}${data.il}, ${data.ulke}</td>
          </tr>
          ${areaValue ? `<tr style="border-top:1px solid #1a1a1a;">
            <td style="color:#666;font-size:12px;padding:8px 0;vertical-align:top;">${t.area}</td>
            <td style="color:#ddd;font-size:13px;padding:8px 0;">${areaValue} m&sup2;</td>
          </tr>` : ''}
          ${data.tas_tercihi.length > 0 ? `<tr style="border-top:1px solid #1a1a1a;">
            <td style="color:#666;font-size:12px;padding:8px 0;vertical-align:top;">${t.stonePreference}</td>
            <td style="color:#ddd;font-size:13px;padding:8px 0;">${data.tas_tercihi.join(', ')}</td>
          </tr>` : ''}
          ${contactLabel ? `<tr style="border-top:1px solid #1a1a1a;">
            <td style="color:#666;font-size:12px;padding:8px 0;vertical-align:top;">${t.contactPreference}</td>
            <td style="color:#ddd;font-size:13px;padding:8px 0;">${contactLabel}</td>
          </tr>` : ''}
        </table>
      </div>

      <!-- Response time -->
      <div style="background:#141414;border-left:3px solid #b39345;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;">
        <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
          ${t.responseTime}
        </p>
      </div>

      <!-- Contact -->
      <div style="text-align:center;padding:20px;background:#141414;border-radius:12px;border:1px solid #222;">
        <p style="color:#666;font-size:10px;margin:0 0 12px;text-transform:uppercase;letter-spacing:2px;">${t.contactTitle}</p>
        <p style="margin:0;">
          <a href="tel:+905532322144" style="color:#b39345;font-size:16px;text-decoration:none;font-weight:600;">+90 553 232 2144</a>
        </p>
        <p style="margin:6px 0 0;">
          <a href="mailto:info@urlastone.com" style="color:#888;font-size:12px;text-decoration:none;">info@urlastone.com</a>
        </p>
        <p style="margin:8px 0 0;">
          <a href="https://www.urlastone.com" style="color:#b39345;font-size:11px;text-decoration:none;letter-spacing:1px;">www.urlastone.com</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;background:#080808;text-align:center;border-top:1px solid #1a1a1a;">
      <p style="color:#444;font-size:10px;margin:0;">&copy; ${new Date().getFullYear()} URLASTONE &mdash; Urla, İzmir, T&uuml;rkiye</p>
      <p style="color:#333;font-size:9px;margin:6px 0 0;">${t.footer}</p>
    </div>
  </div>
</body>
</html>`

  await getResend().emails.send({
    from: `URLASTONE <${FROM_EMAIL}>`,
    to: data.email,
    subject: `${t.subject} — URLASTONE`,
    html,
  })
}

// Admin'e giden bildirim maili (her zaman Turkce)
export async function sendAdminNotification(data: TeklifData) {
  const langLabels: Record<string, string> = { tr: 'Turkce', en: 'English', es: 'Espanol', ar: 'Arabic', de: 'Deutsch' }
  const contactLabels: Record<string, string> = { phone: 'Telefon', email: 'E-posta', whatsapp: 'WhatsApp' }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">

    <!-- Header -->
    <div style="background:#0a0a0a;padding:20px 24px;border-bottom:3px solid #b39345;">
      <h1 style="margin:0;font-size:16px;color:#b39345;letter-spacing:2px;">YENI TEKLIF TALEBI</h1>
    </div>

    <!-- Body -->
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="color:#999;font-size:12px;padding:10px 0;width:130px;font-weight:600;">Ad Soyad</td>
          <td style="color:#333;font-size:14px;padding:10px 0;font-weight:600;">${data.ad_soyad}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="color:#999;font-size:12px;padding:10px 0;font-weight:600;">Telefon</td>
          <td style="padding:10px 0;">
            <a href="tel:${data.telefon}" style="color:#b39345;font-size:14px;text-decoration:none;font-weight:600;">${data.telefon}</a>
          </td>
        </tr>
        ${data.email ? `<tr style="border-bottom:1px solid #f0f0f0;">
          <td style="color:#999;font-size:12px;padding:10px 0;font-weight:600;">E-posta</td>
          <td style="padding:10px 0;">
            <a href="mailto:${data.email}" style="color:#333;font-size:13px;text-decoration:none;">${data.email}</a>
          </td>
        </tr>` : ''}
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="color:#999;font-size:12px;padding:10px 0;font-weight:600;">Konum</td>
          <td style="color:#333;font-size:13px;padding:10px 0;">${data.ilce ? data.ilce + ', ' : ''}${data.il}, ${data.ulke}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="color:#999;font-size:12px;padding:10px 0;font-weight:600;">Proje Tipi</td>
          <td style="color:#333;font-size:13px;padding:10px 0;">${data.proje_tipi}</td>
        </tr>
        ${data.metrekare ? `<tr style="border-bottom:1px solid #f0f0f0;">
          <td style="color:#999;font-size:12px;padding:10px 0;font-weight:600;">Metrekare</td>
          <td style="color:#333;font-size:13px;padding:10px 0;">${data.metrekare}</td>
        </tr>` : ''}
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="color:#999;font-size:12px;padding:10px 0;font-weight:600;">Tas Tercihi</td>
          <td style="color:#333;font-size:13px;padding:10px 0;">${data.tas_tercihi.length > 0 ? data.tas_tercihi.join(', ') : '—'}</td>
        </tr>
        ${data.iletisim_turu ? `<tr style="border-bottom:1px solid #f0f0f0;">
          <td style="color:#999;font-size:12px;padding:10px 0;font-weight:600;">Iletisim Tercihi</td>
          <td style="color:#333;font-size:13px;padding:10px 0;">${contactLabels[data.iletisim_turu] || data.iletisim_turu}</td>
        </tr>` : ''}
        ${data.tercih_dil ? `<tr style="border-bottom:1px solid #f0f0f0;">
          <td style="color:#999;font-size:12px;padding:10px 0;font-weight:600;">Tercih Dili</td>
          <td style="color:#333;font-size:13px;padding:10px 0;">${langLabels[data.tercih_dil] || data.tercih_dil}</td>
        </tr>` : ''}
        ${data.aciklama ? `<tr style="border-bottom:1px solid #f0f0f0;">
          <td style="color:#999;font-size:12px;padding:10px 0;vertical-align:top;font-weight:600;">Not</td>
          <td style="color:#333;font-size:13px;padding:10px 0;line-height:1.5;">${data.aciklama}</td>
        </tr>` : ''}
        ${data.kaynak ? `<tr>
          <td style="color:#999;font-size:12px;padding:10px 0;font-weight:600;">Kaynak</td>
          <td style="color:#333;font-size:13px;padding:10px 0;">${data.kaynak}</td>
        </tr>` : ''}
      </table>

      <div style="margin-top:20px;text-align:center;">
        <a href="https://urlastone.com/admin" style="display:inline-block;background:#b39345;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Admin Paneli Ac</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:12px 24px;background:#f9f9f9;text-align:center;border-top:1px solid #e0e0e0;">
      <p style="color:#999;font-size:10px;margin:0;">Bu mail otomatik olarak gonderilmistir — urlastone.com</p>
    </div>
  </div>
</body>
</html>`

  await getResend().emails.send({
    from: `URLASTONE Web <${FROM_EMAIL}>`,
    to: ADMIN_EMAILS,
    subject: `Yeni Teklif: ${data.ad_soyad} — ${data.proje_tipi}`,
    html,
  })
}
