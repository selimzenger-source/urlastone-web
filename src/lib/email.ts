import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'info@urlastone.com'

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
  aciklama?: string
  kaynak?: string
}

// Müşteriye giden onay maili
export async function sendCustomerConfirmation(data: TeklifData) {
  if (!data.email) return

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#111111;border-radius:16px;overflow:hidden;margin-top:20px;margin-bottom:20px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#b39345,#d2b96e,#b39345);padding:32px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:700;color:#0a0a0a;letter-spacing:2px;">URLASTONE</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#0a0a0a;opacity:0.7;letter-spacing:1px;">DOĞAL TAŞ</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <h2 style="color:#ffffff;font-size:20px;margin:0 0 8px;">Talebiniz Alındı</h2>
      <p style="color:#999;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Sayın <strong style="color:#d2b96e;">${data.ad_soyad}</strong>, teklif talebiniz başarıyla alınmıştır.
        En kısa sürede sizinle iletişime geçeceğiz.
      </p>

      <!-- Talep Özeti -->
      <div style="background:#1a1a1a;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h3 style="color:#b39345;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Talep Özeti</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#666;font-size:12px;padding:6px 0;vertical-align:top;width:120px;">Proje Tipi</td>
            <td style="color:#ccc;font-size:13px;padding:6px 0;">${data.proje_tipi}</td>
          </tr>
          <tr>
            <td style="color:#666;font-size:12px;padding:6px 0;vertical-align:top;">Konum</td>
            <td style="color:#ccc;font-size:13px;padding:6px 0;">${data.ilce ? data.ilce + ', ' : ''}${data.il}, ${data.ulke}</td>
          </tr>
          ${data.metrekare ? `<tr>
            <td style="color:#666;font-size:12px;padding:6px 0;vertical-align:top;">Alan</td>
            <td style="color:#ccc;font-size:13px;padding:6px 0;">${data.metrekare}</td>
          </tr>` : ''}
          ${data.tas_tercihi.length > 0 ? `<tr>
            <td style="color:#666;font-size:12px;padding:6px 0;vertical-align:top;">Taş Tercihi</td>
            <td style="color:#ccc;font-size:13px;padding:6px 0;">${data.tas_tercihi.join(', ')}</td>
          </tr>` : ''}
        </table>
      </div>

      <p style="color:#666;font-size:13px;line-height:1.6;margin:0 0 24px;">
        Genellikle <strong style="color:#999;">24 saat</strong> içinde dönüş yapıyoruz.
        Acil durumlar için bizi doğrudan arayabilirsiniz.
      </p>

      <!-- Contact -->
      <div style="text-align:center;padding:16px;background:#1a1a1a;border-radius:12px;">
        <p style="color:#666;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">İletişim</p>
        <p style="margin:0;">
          <a href="tel:+905532322144" style="color:#d2b96e;font-size:14px;text-decoration:none;">+90 553 232 2144</a>
        </p>
        <p style="margin:4px 0 0;">
          <a href="mailto:info@urlastone.com" style="color:#999;font-size:12px;text-decoration:none;">info@urlastone.com</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #1a1a1a;text-align:center;">
      <p style="color:#444;font-size:11px;margin:0;">© ${new Date().getFullYear()} URLASTONE — Urla, İzmir</p>
      <p style="color:#333;font-size:10px;margin:4px 0 0;">
        <a href="https://urlastone.com" style="color:#b39345;text-decoration:none;">urlastone.com</a>
      </p>
    </div>
  </div>
</body>
</html>`

  await resend.emails.send({
    from: `URLASTONE <${FROM_EMAIL}>`,
    to: data.email,
    subject: 'Teklif Talebiniz Alındı — URLASTONE',
    html,
  })
}

// Admin'e giden bildirim maili
export async function sendAdminNotification(data: TeklifData) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">

    <!-- Header -->
    <div style="background:#0a0a0a;padding:20px 24px;border-bottom:3px solid #b39345;">
      <h1 style="margin:0;font-size:16px;color:#b39345;letter-spacing:2px;">YENİ TEKLİF TALEBİ</h1>
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
          <td style="color:#999;font-size:12px;padding:10px 0;font-weight:600;">Taş Tercihi</td>
          <td style="color:#333;font-size:13px;padding:10px 0;">${data.tas_tercihi.length > 0 ? data.tas_tercihi.join(', ') : '—'}</td>
        </tr>
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
        <a href="https://urlastone.com/admin" style="display:inline-block;background:#b39345;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Admin Paneli Aç</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:12px 24px;background:#f9f9f9;text-align:center;border-top:1px solid #e0e0e0;">
      <p style="color:#999;font-size:10px;margin:0;">Bu mail otomatik olarak gönderilmiştir — urlastone.com</p>
    </div>
  </div>
</body>
</html>`

  await resend.emails.send({
    from: `URLASTONE Web <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `Yeni Teklif: ${data.ad_soyad} — ${data.proje_tipi}`,
    html,
  })
}
